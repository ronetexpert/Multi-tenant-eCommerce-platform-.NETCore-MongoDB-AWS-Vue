﻿using Grand.Business.Authentication.Interfaces;
using Grand.Domain.Configuration;
using Grand.Domain.Data;
using Grand.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Facebook;
using Microsoft.AspNetCore.Authentication.OAuth;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using MongoDB.Bson.Serialization;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace Authentication.Facebook.Infrastructure
{
    /// <summary>
    /// Registration of Facebook authentication service (plugin)
    /// </summary>
    public class FacebookAuthenticationBuilder : IAuthenticationBuilder
    {
        /// <summary>
        /// Configure
        /// </summary>
        /// <param name="builder">Authentication builder</param>
        public void AddAuthentication(AuthenticationBuilder builder, IConfiguration configuration)
        {
            builder.AddFacebook(FacebookDefaults.AuthenticationScheme, options =>
            {
                var settings = new FacebookExternalAuthSettings();
                try
                {
                    var fbSettings = new Repository<Setting>(DataSettingsHelper.ConnectionString()).Table.Where(x => x.Name.StartsWith("facebookexternalauthsettings"));
                    if (fbSettings.Any())
                    {
                        settings = BsonSerializer.Deserialize<FacebookExternalAuthSettings>(fbSettings.FirstOrDefault().Metadata);
                    }
                }
                catch { };

                //no empty values allowed. otherwise, an exception could be thrown on application startup
                options.AppId = !string.IsNullOrWhiteSpace(settings.ClientKeyIdentifier) ? settings.ClientKeyIdentifier : "000";
                options.AppSecret = !string.IsNullOrWhiteSpace(settings.ClientSecret) ? settings.ClientSecret : "000";
                options.SaveTokens = true;
                //handles exception thrown by external auth provider
                options.Events = new OAuthEvents()
                {
                    OnRemoteFailure = ctx =>
                    {
                        ctx.HandleResponse();
                        var errorCode = ctx.Request.Query["error_code"].FirstOrDefault();
                        var errorMessage = ctx.Request.Query["error_message"].FirstOrDefault();
                        var state = ctx.Request.Query["state"].FirstOrDefault();
                        errorCode = WebUtility.UrlEncode(errorCode);
                        errorMessage = WebUtility.UrlEncode(errorMessage);
                        ctx.Response.Redirect($"/fb-signin-failed?error_code={errorCode}&error_message={errorMessage}");

                        return Task.FromResult(0);
                    }
                };
            });
        }

        /// <summary>
        /// Gets order of this registrar implementation
        /// </summary>
        public int Priority => 501;
    }
}