﻿using Grand.Web.Common.Security.Captcha;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.Extensions.Primitives;
using System.Threading.Tasks;

namespace Grand.Web.Common.Filters
{
    /// <summary>
    /// Represents a filter attribute enabling CAPTCHA validation
    /// </summary>
    public class ValidateCaptchaAttribute : TypeFilterAttribute
    {
        /// <summary>
        /// Create instance of the filter attribute 
        /// </summary>
        /// <param name="actionParameterName">The name of the action parameter to which the result will be passed</param>
        public ValidateCaptchaAttribute(string actionParameterName = "captchaValid") : base(typeof(ValidateCaptchaFilter))
        {
            Arguments = new object[] { actionParameterName };
        }

        #region Filter

        /// <summary>
        /// Represents a filter enabling CAPTCHA validation
        /// </summary>
        private class ValidateCaptchaFilter : IAsyncActionFilter
        {
            #region Constants

            private const string CHALLENGE_FIELD_KEY = "recaptcha_challenge_field";
            private const string RESPONSE_FIELD_KEY = "recaptcha_response_field";
            private const string G_RESPONSE_FIELD_KEY_V3 = "g-recaptcha-response-value";
            private const string G_RESPONSE_FIELD_KEY_V2 = "g-recaptcha-response";

            #endregion

            #region Fields

            private readonly string _actionParameterName;
            private readonly CaptchaSettings _captchaSettings;
            private readonly GoogleReCaptchaValidator _googleReCaptchaValidator;

            #endregion

            #region Ctor

            public ValidateCaptchaFilter(string actionParameterName, CaptchaSettings captchaSettings, GoogleReCaptchaValidator googleReCaptchaValidator)
            {
                _actionParameterName = actionParameterName;
                _captchaSettings = captchaSettings;
                _googleReCaptchaValidator = googleReCaptchaValidator;
            }

            #endregion

            #region Utilities

            /// <summary>
            /// Validate CAPTCHA
            /// </summary>
            /// <param name="context">A context for action filters</param>
            /// <returns>True if CAPTCHA is valid; otherwise false</returns>
            protected async Task<bool> ValidateCaptcha(ActionExecutingContext context)
            {
                var isValid = false;

                //get form values
                var form = await context.HttpContext.Request.ReadFormAsync();
                var captchaChallengeValue = form[CHALLENGE_FIELD_KEY];
                var captchaResponseValue = form[RESPONSE_FIELD_KEY];
                var gCaptchaResponseValue = string.Empty;
                foreach (var item in form.Keys)
                {
                    if (item.Contains(G_RESPONSE_FIELD_KEY_V3))
                        gCaptchaResponseValue = form[item];
                }

                if(string.IsNullOrEmpty(gCaptchaResponseValue))
                    gCaptchaResponseValue = form[G_RESPONSE_FIELD_KEY_V2];
                
                if ((!StringValues.IsNullOrEmpty(captchaChallengeValue) && !StringValues.IsNullOrEmpty(captchaResponseValue)) || !string.IsNullOrEmpty(gCaptchaResponseValue))
                {
                    //Captcha validate request
                    var recaptchaResponse = await _googleReCaptchaValidator.Validate(!StringValues.IsNullOrEmpty(captchaResponseValue) ? captchaResponseValue.ToString() : gCaptchaResponseValue);
                    isValid = recaptchaResponse.IsValid;
                    if (!isValid)
                        foreach (var error in recaptchaResponse.ErrorCodes)
                        {
                            context.ModelState.AddModelError("", error);
                        }
                }

                return isValid;
            }

            #endregion

            #region Methods
            public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
            {
                if (context == null || context.HttpContext == null || context.HttpContext.Request == null)
                {
                    await next();
                    return;
                }                

                //whether CAPTCHA is enabled
                if (_captchaSettings.Enabled && context.HttpContext != null && context.HttpContext.Request != null)
                {
                    //push the validation result as an action parameter
                    context.ActionArguments[_actionParameterName] = await ValidateCaptcha(context);
                }
                else
                    context.ActionArguments[_actionParameterName] = false;

                await next();

            }
            #endregion
        }

        #endregion
    }
}