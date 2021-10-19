﻿function deletecartitem(href) {
    axios({
        method: "post",
        baseURL: href
    }).then(function (response) {
        var newfly = response.data.sidebarshoppingcartmodel;
        this.flycart = newfly;
        this.flycartitems = newfly.Items;
        this.flycartindicator = newfly.TotalProducts;
        vm.flycart = newfly;
        vm.flycartitems = newfly.Items;
        vm.flycartindicator = newfly.TotalProducts;
    }).catch(function (error) {
        alert(error);
    });
    return false;
}

function displayPopupPrivacyPreference(html) {
    new Vue({
        el: '#ModalPrivacyPreference',
        data: {
            template: null,
            darkMode: false,
        },
        render: function (createElement) {
            if (!this.template) {
                return createElement('b-overlay', {
                    attrs: { show: 'true' }
                });
            } else {
                return this.template();
            }
        },
        methods: {
            showModal: function() {
                this.$refs['ModalPrivacyPreference'].show()
            }
        },
        watch: {
            darkMode: function (newValue) {
                localStorage.darkMode = newValue;
            },
        },
        mounted: function () {
            var self = this;
            self.template = Vue.compile(html).render;
            if (localStorage.darkMode == "true") this.darkMode = true;
        },
        updated: function () {
            this.showModal();
        }
    });
}
function displayPopupNewsletterCategory(html) {
    new Vue({
        el: '#ModalNewsletterCategory',
        data: {
            template: null,
            darkMode: false,
        },
        render: function (createElement) {
            if (!this.template) {
                return createElement('b-overlay', {
                    attrs: { show: 'true' }
                });
            } else {
                return this.template();
            }
        },
        methods: {
            showModal: function () {
                this.$refs['ModalNewsletterCategory'].show()
            }
        },
        watch: {
            darkMode: function (newValue) {
                localStorage.darkMode = newValue;
            },
        },
        mounted: function () {
            var self = this;
            self.template = Vue.compile(html).render;
            if (localStorage.darkMode == "true") this.darkMode = true;
        },
        updated: function () {
            this.showModal();
        }
    });
}


function displayBarNotification(message, messagetype, timeout) {
    if (messagetype == 'error') {
        toastHTML = '<b-toast id="grandToast" auto-hide-delay=' + timeout +' variant="danger" title=' + messagetype +'>'+ message +'</b-toast>'
    } else {
        toastHTML = '<b-toast id="grandToast" auto-hide-delay=' + timeout +' variant="info" title=' + messagetype+'>' + message + '</b-toast>'
    }
    document.querySelector('.modal-place').innerHTML = toastHTML;
    new Vue({
        el: ".modal-place",
        methods: {
            toast: function () {
                this.$bvToast.show('grandToast')
            }
        },
        mounted: function () {
            this.toast();
        }
    });
}

// CSRF (XSRF) security
function addAntiForgeryToken(data) {
    //if the object is undefined, create a new one.
    if (!data) {
        data = {};
    }
    //add token
    var tokenInput = document.querySelector('input[name=__RequestVerificationToken]');
    if (tokenInput) {
        data.__RequestVerificationToken = tokenInput.value;
    }
    return data;
};

function newsletter_subscribe(subscribe) {
    var subscribeProgress = document.getElementById("subscribe-loading-progress");
    subscribeProgress.style.display = "block";
    var postData = {
        subscribe: subscribe,
        email: document.getElementById("newsletter-email").value
    };
    var href = document.getElementById("newsletterbox").getAttribute('data-href');
    axios({
        url: href,
        params: postData,
        method: 'post',
    }).then(function (response) {
        subscribeProgress.style.display = "none";
        document.querySelector("#newsletter-result-block .alert").innerHTML = response.data.Result;
        if (response.data.Success) {
            document.querySelector('.newsletter-inputs .input-group').style.display = "none";
            if (document.querySelector('.newsletter-inputs .newsletter-subscribe-unsubscribe')) {
                document.querySelector('.newsletter-inputs .newsletter-subscribe-unsubscribe').style.display = "none";
            }
            document.querySelector("#newsletter-result-block").style.display = "block";
            document.getElementById('newsletter-result-block').classList.add("success");
            document.getElementById('newsletter-result-block').style.bottom = "unset";
            if (response.data.Showcategories) {
                displayPopupNewsletterCategory(response.data.ResultCategory)
            }
        } else {
            document.querySelector("#newsletter-result-block").style.display = "block";
            window.setTimeout(function () {
                document.getElementById('newsletter-result-block').style.display = "none"
            }, 2000);
        }
    }).catch(function (error) {
        subscribeProgress.style.display = "none";
    })
}

function newsletter_subscribe_category(url) {
    var form = document.getElementById('newsletter-category-method-form');
    var data = new FormData(form);
    axios({
        url: url,
        method: 'post',
        data: data,
    }).then(function (response) {
        if (!response.data.Success) {
            alert(response.data.Message);
        }
    }).catch(function (error) {
        alert(error);
    })
}

function newsletterBox() {
    if (document.getElementById('newsletter-subscribe-button')) {
        var el = document.getElementById('newsletter-subscribe-button');
        el.onclick = function () {
            var allowToUnsubscribe = document.getElementById("newsletterbox").getAttribute('data-allowtounsubscribe').toLowerCase();
            if (allowToUnsubscribe == 'true') {
                if (document.getElementById('newsletter_subscribe').checked) {
                    newsletter_subscribe('true');
                }
                else {
                    newsletter_subscribe('false');
                }
            }
            else {
                newsletter_subscribe('true');
            }
        };
        document.getElementById("newsletter-email").addEventListener("keyup", function (event) {
            if (event.keyCode == 13) {
                document.getElementById("newsletter-subscribe-button").click();
            }
        });
    }
}

// runs an array of async functions in sequential order
function seq(arr, callback, index) {
    // first call, without an index
    if (typeof index === 'undefined') {
        index = 0
    }
    if (arr.length > 0) {

        arr[index](function () {
            index++
            if (index === arr.length) {
                callback()
            } else {
                seq(arr, callback, index)
            }
        })
    }
}

// trigger DOMContentLoaded
function scriptsDone() {
    var DOMContentLoadedEvent = document.createEvent('Event')
    DOMContentLoadedEvent.initEvent('DOMContentLoaded', true, true)
    document.dispatchEvent(DOMContentLoadedEvent)
}

/* script runner
 */

function insertScript($script, callback) {
    var s = document.createElement('script')
    s.type = 'text/javascript'
    if ($script.src) {
        s.onload = callback
        s.onerror = callback
        s.src = $script.src
    } else {
        s.textContent = $script.innerText
    }

    // re-insert the script tag so it executes.
    document.body.appendChild(s)

    // clean-up
    $script.parentNode.removeChild($script)

    // run the callback immediately for inline scripts
    if (!$script.src) {
        callback()
    }
}

// https://html.spec.whatwg.org/multipage/scripting.html
var runScriptTypes = [
    'application/javascript',
    'application/ecmascript',
    'application/x-ecmascript',
    'application/x-javascript',
    'text/ecmascript',
    'text/javascript',
    'text/javascript1.0',
    'text/javascript1.1',
    'text/javascript1.2',
    'text/javascript1.3',
    'text/javascript1.4',
    'text/javascript1.5',
    'text/jscript',
    'text/livescript',
    'text/x-ecmascript',
    'text/x-javascript'
]

function runScripts($container) {
    // get scripts tags from a node
    var $scripts = $container.querySelectorAll('script')
    var runList = []
    var typeAttr

    [].forEach.call($scripts, function ($script) {
        typeAttr = $script.getAttribute('type')

        // only run script tags without the type attribute
        // or with a javascript mime attribute value
        if (!typeAttr || runScriptTypes.indexOf(typeAttr) !== -1) {
            runList.push(function (callback) {
                insertScript($script, callback)
            })
        }
    })

    // insert the script tags sequentially
    // to preserve execution order
    seq(runList, scriptsDone)
}

function sendcontactusform(urladd) {
    if (document.querySelector('#ModalQuickView') == null) {
        if (document.querySelector(".product-standard #product-details-form").checkValidity()) {
            var bodyFormData = new FormData();
            bodyFormData.append('AskQuestionEmail', document.querySelector('.product-standard #AskQuestionEmail').value);
            bodyFormData.append('AskQuestionFullName', document.querySelector('.product-standard #AskQuestionFullName').value);
            bodyFormData.append('AskQuestionPhone', document.querySelector('.product-standard #AskQuestionPhone').value);
            bodyFormData.append('AskQuestionMessage', document.querySelector('.product-standard #AskQuestionMessage').value);
            bodyFormData.append('Id', document.querySelector('.product-standard #AskQuestionProductId').value);
            bodyFormData.append('__RequestVerificationToken', document.querySelector('.product-standard input[name=__RequestVerificationToken]').value);
            if (document.querySelector(".product-standard textarea[id^='g-recaptcha-response']")) {
                bodyFormData.append('g-recaptcha-response-value', document.querySelector(".product-standard textarea[id^='g-recaptcha-response']").value);
            }
            axios({
                url: urladd,
                data: bodyFormData,
                method: 'post',
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(function (response) {
                if (response.data.success) {
                    document.querySelector('.product-standard #contact-us-product').style.display = "none";
                    document.querySelector('.product-standard .product-contact-error').style.display = "none";
                    document.querySelector('.product-standard .product-contact-send').innerHTML = response.data.message;
                    document.querySelector('.product-standard .product-contact-send').style.display = "block";
                }
                else {
                    document.querySelector('.product-standard .product-contact-error').innerHTML = response.data.message;
                    document.querySelector('.product-standard .product-contact-error').style.display = "block";
                }
            }).catch(function (error) {
                alert(error);
            });
        }
    } else {
        if (document.querySelector("#ModalQuickView #product-details-form").checkValidity()) {
            var bodyFormData = new FormData();
            bodyFormData.append('AskQuestionEmail', document.querySelector('#ModalQuickView #AskQuestionEmail').value);
            bodyFormData.append('AskQuestionFullName', document.querySelector('#ModalQuickView #AskQuestionFullName').value);
            bodyFormData.append('AskQuestionPhone', document.querySelector('#ModalQuickView #AskQuestionPhone').value);
            bodyFormData.append('AskQuestionMessage', document.querySelector('#ModalQuickView #AskQuestionMessage').value);
            bodyFormData.append('Id', document.querySelector('#ModalQuickView #AskQuestionProductId').value);
            bodyFormData.append('__RequestVerificationToken', document.querySelector('#ModalQuickView input[name=__RequestVerificationToken]').value);
            if (document.querySelector("#ModalQuickView textarea[id^='g-recaptcha-response']")) {
                bodyFormData.append('g-recaptcha-response-value', document.querySelector("#ModalQuickView textarea[id^='g-recaptcha-response']").value);
            }
            axios({
                url: urladd,
                data: bodyFormData,
                method: 'post',
                headers: { 'Content-Type': 'multipart/form-data' }
            }).then(function (response) {
                if (response.data.success) {
                    document.querySelector('#ModalQuickView #contact-us-product').style.display = "none";
                    document.querySelector('#ModalQuickView .product-contact-error').style.display = "none";
                    document.querySelector('#ModalQuickView .product-contact-send').innerHTML = response.data.message;
                    document.querySelector('#ModalQuickView .product-contact-send').style.display = "block";
                }
                else {
                    document.querySelector('#ModalQuickView .product-contact-error').innerHTML = response.data.message;
                    document.querySelector('#ModalQuickView .product-contact-error').style.display = "block";
                }
            }).catch(function (error) {
                alert(error);
            });
        }
    }
}

function GetPrivacyPreference(href) {
    axios({
        url: href,
        method: 'get',
    }).then(function (response) {
        displayPopupPrivacyPreference(response.data.html)
    }).catch(function (error) {
        alert(error);
    });
}
function SavePrivacyPreference(href) {
    var form = document.querySelector('#frmPrivacyPreference');
    var data = new FormData(form);
    axios({
        url: href,
        method: 'post',
        data: data
    }).then(function (response) {
        
    }).catch(function (error) {
        alert(error);
    });
}

function SaveCurrentPossition(href, latitude, longitude) {
    var bodyData = new FormData();
    bodyData.append('latitude', latitude);
    bodyData.append('longitude', longitude);
    axios({
        url: href,
        method: 'post',
        data: bodyData
    }).then(function (response) {

    }).catch(function (error) {
        alert(error);
    });   
}

function newAddress(isNew) {
    if (isNew) {
        this.resetSelectedAddress();
        document.getElementById('pickup-new-address-form').style.display = "block";
    } else {
        document.getElementById('pickup-new-address-form').style.display = "none";
    }
}

function resetSelectedAddress() {
    var selectElement = document.getElementById('pickup-address-select');
    if (selectElement) {
        selectElement.value = "";
    }
}

function displayPopupNotification(message, messagetype) {
    //types: success, error

    //we do not encode displayed message
    var htmlcode = '';
    if ((typeof message) == 'string') {
        htmlcode = '<b-modal ref="grandModal" id="grandModal" centered hide-footer hide-header><div class="alert alert-info d-block mb-0">' + message + '</div></b-modal>';
        document.querySelector('.modal-place').innerHTML = htmlcode;
        new Vue({
            el: '#grandModal',
            data: {
                template: null,
                hover: false
            },
            render: function (createElement) {
                if (!this.template) {
                    return createElement('b-overlay', {
                        attrs: { show: 'true' }
                    });
                } else {
                    return this.template();
                }
            },
            methods: {
                showModal: function () {
                    this.$refs['grandModal'].show()
                },
            },
            mounted: function () {
                var self = this;
                self.template = Vue.compile(htmlcode).render;
            },
            updated: function () {
                this.showModal();
            }
        });
    } else {
            new Vue({
                el: "#app",
                methods: {
                    toast: function () {
                        for (var i = 0; i < message.length; i++) {
                            if (messagetype == 'error') {
                                this.$bvToast.toast(message[i], {
                                    title: messagetype,
                                    variant: 'danger',
                                    autoHideDelay: 5000,
                                })
                            } else {
                                this.$bvToast.toast(message[i], {
                                    title: messagetype,
                                    variant: 'info',
                                    autoHideDelay: 5000,
                                })
                            }
                        }
                    }
                },
                mounted: function () {
                    this.toast();
                }
            });

    }
}

function CloseSearchBox() {
    window.addEventListener('click', function () {
        if (document.getElementById('adv_search')) {
            searchbox.text = "";
            searchbox.searchitems = null;
        }
    });
}
function StopPropagation(event) {
    event.stopPropagation();
}

function backToTop() {
    if (!document.querySelector('.up-btn')) {
        const upBtn = document.createElement('div');
        const upBtnContent = document.createElement('div');

        upBtn.classList.add('up-btn', 'up-btn__hide');

        function showBtn(num) {
            if (document.documentElement.scrollTop >= num) {
                upBtn.classList.remove('up-btn__hide');
            } else {
                upBtn.classList.add('up-btn__hide');
            }
        }

        document.body.append(upBtn);
        upBtn.append(upBtnContent)
        window.addEventListener('scroll', () => {
            showBtn(400);
        });

        upBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: "smooth"
            });
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    newsletterBox();
    CloseSearchBox();
    backToTop();
});

/* MENU */
(function () {
    function $(selector, context) {
        context = context || document;
        return context["querySelectorAll"](selector);
    }

    function forEach(collection, iterator) {
        for (var key in Object.keys(collection)) {
            iterator(collection[key]);
        }
    }

    function showMenu(menu) {
        var menu = this;
        var ul = $("ul", menu)[0];

        if (!ul || ul.classList.contains("-visible")) return;

        ul.classList.add("-visible");
    }

    function hideMenu(menu) {
        var menu = this;
        var ul = menu.parentElement;

        if (!ul || !ul.classList.contains("-visible")) return;

        setTimeout(function () {
            ul.classList.remove("-visible");
        }, 300);
    }

    window.addEventListener("load", function () {
        forEach($(".Menu li.-hasSubmenu"), function (e) {
            e.showMenu = showMenu;
            e.hideMenu = hideMenu;
        });

        forEach($(".Menu > li.-hasSubmenu"), function (e) {
            e.addEventListener("click", showMenu);
        });

        forEach($(".Menu li .back"), function (e) {
            e.addEventListener("click", hideMenu);
        });

        forEach($(".Menu > li.-hasSubmenu li.-hasSubmenu"), function (e) {
            e.addEventListener("click", showMenu);
        });
    });
})();

/* ENDMENU */

/* RESERVATION */
var Reservation = {
    availableDates: [],
    availableDatesFrom: [],
    availableDatesTo: [],
    currentMonth: -1,
    currentYear: -1,
    currentMonthFrom: -1,
    currentYearFrom: -1,
    currentMonthTo: -1,
    currentYearTo: -1,
    _parameter: "",
    noReservationsMessage: "",
    productId: "",
    ajaxUrl: "",
    ajaxUrl2: "",
    startDate: "",
    startDateMonth: "",
    startDateYear: "",

    init: function init(startDate, startDateYear, startDateMonth, noReservationsMessage, ajaxUrl, productId, ajaxUrl2) {
        this.noReservationsMessage = noReservationsMessage;
        this.ajaxUrl = ajaxUrl;
        this.ajaxUrl2 = ajaxUrl2;
        this.productId = productId;
        this.startDate = startDate;
        this.startDateMonth = startDateMonth;
        this.startDateYear = startDateYear;

        if (document.getElementById("reservationDatepicker") != null) {
            this.fillAvailableDates(startDateYear, startDateMonth, Reservation._parameter, false);
        }

        if (document.getElementById("reservationDatepickerFrom") != null) {
            this.fillAvailableDatesFrom(startDateYear, startDateMonth);
        }

        if (document.getElementById("reservationDatepickerTo") != null) {
            this.fillAvailableDatesTo(startDateYear, startDateMonth);
        }
        var defdate = new Date(this.startDate);
        var reservationDatepicker = new Pikaday({
            field: document.getElementById('reservationDatepicker'),
            onSelect: this.onDatePickerDateChange,
            disableDayFn: this.daysToMark,
            format: 'MM/DD/YYYY',
            toString: function(date, format) {
                // you should do formatting based on the passed format,
                // but we will just return 'D/M/YYYY' for simplicity
                const day = ("0" + date.getDate()).slice(-2);
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            },
            parse: function(dateString, format) {
                // dateString is the result of `toString` method
                const parts = dateString.split('/');
                const day = parts[0];
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day);
            },
            onDraw: function (date) {
                var year = date.calendars[0].year.toString();
                var month = (date.calendars[0].month + 1).toString();
                if (document.getElementById("hoursDiv") != null) {
                    document.getElementById("hoursDiv").innerHTML = '';
                }
                Reservation.fillAvailableDates(year, month, Reservation._parameter, false);
                Reservation.onDatePickerDateChange();
            },
            firstDay: 1,
            defaultDate: defdate
        });

        var reservationDatepickerFrom = new Pikaday({
            field: document.getElementById('reservationDatepickerFrom'),
            onSelect: this.onDatePickerSelect,
            disableDayFn: this.daysToMarkFrom,
            format: 'MM/DD/YYYY',
            toString: function (date, format) {
                // you should do formatting based on the passed format,
                // but we will just return 'D/M/YYYY' for simplicity
                const day = ("0" + date.getDate()).slice(-2);
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            },
            parse: function (dateString, format) {
                // dateString is the result of `toString` method
                const parts = dateString.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day);
            },
            onDraw: function (date) {
                var year = date.calendars[0].year.toString();
                var month = (date.calendars[0].month + 1).toString();
                Reservation.fillAvailableDatesFrom(year, month);
            },
            firstDay: 1,
            defaultDate: defdate
        });

        var reservationDatepickerTo = new Pikaday({
            field: document.getElementById('reservationDatepickerTo'),
            onSelect: this.onDatePickerSelect,
            disableDayFn: this.daysToMarkTo,
            format: 'MM/DD/YYYY',
            toString: function (date, format) {
                // you should do formatting based on the passed format,
                // but we will just return 'D/M/YYYY' for simplicity
                const day = ("0" + date.getDate()).slice(-2);
                const month = ("0" + (date.getMonth() + 1)).slice(-2);
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            },
            parse: function (dateString, format) {
                // dateString is the result of `toString` method
                const parts = dateString.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10);
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day);
            },
            onDraw: function (date) {
                var year = date.calendars[0].year.toString();
                var month = (date.calendars[0].month + 1).toString();
                Reservation.fillAvailableDatesTo(year, month);
            },
            firstDay: 1,
            defaultDate: defdate
        });

        this.onDatePickerDateChange();
        var dropdown = document.getElementById("parameterDropdown");
        if (dropdown != null) {
            document.querySelector("#parameterDropdown").addEventListener('change', function () {
                Reservation.fillAvailableDates(Reservation.currentYear, Reservation.currentMonth, this.value);
                reservationDatepicker.clear();
                if (document.getElementById("hoursDiv") != null) {
                    document.getElementById("hoursDiv").innerHTML = Reservation.noReservationsMessage;
                }
            });
        }
    },

    reload: function init(startDate, startDateYear, startDateMonth) {
        this.startDate = startDate;
        this.startDateMonth = startDateMonth;
        this.startDateYear = startDateYear;

        this.fillAvailableDates(startDateYear, startDateMonth, Reservation._parameter, false);

        var reservationDatepickerFromRe = new Pikaday({
            field: document.getElementById('reservationDatepicker'),
            onSelect: this.onDatePickerDateChange,
            disableDayFn: this.daysToMark,
            format: 'MM/DD/YYYY',
            toString: function(date, format) {
                // you should do formatting based on the passed format,
                // but we will just return 'D/M/YYYY' for simplicity
                const day = ("0" + date.getDate()).slice(-2);
                const month = date.getMonth() + 1;
                const year = date.getFullYear();
                return `${month}/${day}/${year}`;
            },
            parse: function (dateString, format) {
                // dateString is the result of `toString` method
                const parts = dateString.split('/');
                const day = parseInt(parts[0], 10);
                const month = parseInt(parts[1], 10) - 1;
                const year = parseInt(parts[2], 10);
                return new Date(year, month, day);
            },
            onDraw: function (date) {
                var year = date.calendars[0].year.toString();
                var month = (date.calendars[0].month + 1).toString();
                if (document.getElementById("hoursDiv") != null) {
                    document.getElementById("hoursDiv").innerHTML = '';
                }
                Reservation.fillAvailableDates(year, month, Reservation._parameter, false);
            },
            firstDay: 1,
            defaultDate: this.startDate
        });

        this.onDatePickerDateChange();
    },

    daysToMark: function daysToMark(date) {
        for (i = 0; i < Reservation.availableDates.length; i++) {
            var splitResults = Reservation.availableDates[i].Date.split("-");
            var year = splitResults[0];
            var month = splitResults[1];
            var day = splitResults[2].substring(0, 2);
            if (date.getYear() + 1900 == year && date.getMonth() + 1 == month && date.getDate() == day) {
                return false;
            }
        }

        return true;
    },

    daysToMarkTo: function daysToMark(date) {
        for (i = 0; i < Reservation.availableDatesTo.length; i++) {
            var splitResults = Reservation.availableDatesTo[i].Date.split("-");
            var year = splitResults[0];
            var month = splitResults[1];
            var day = splitResults[2].substring(0, 2);

            if (date.getYear() + 1900 == year && date.getMonth() + 1 == month && date.getDate() == day) {
                return false
            }
        }

        return true;
    },

    daysToMarkFrom: function daysToMark(date) {
        for (i = 0; i < Reservation.availableDatesFrom.length; i++) {
            var splitResults = Reservation.availableDatesFrom[i].Date.split("-");
            var year = splitResults[0];
            var month = splitResults[1];
            var day = splitResults[2].substring(0, 2);
            if (date.getYear() + 1900 == year && date.getMonth() + 1 == month && date.getDate() == day) {
                return false;
            }
        }

        return true;
    },

    onDatePickerDateChange: function onDatePickerDateChange() {
        if (document.querySelector("#reservationDatepicker") != null) {
            var selected = document.querySelector("#reservationDatepicker").value;
        } else {
            var selected = null;
        }
        if (selected != null) {
            document.querySelector("#hoursDiv").innerHTML = '';
            var selectedSplitResults = selected.split("/");
            var selectedDay = selectedSplitResults[1];
            var selectedMonth = selectedSplitResults[0];
            var selectedYear = selectedSplitResults[2];

            for (i = 0; i < Reservation.availableDates.length; i++) {
                var splitResults = Reservation.availableDates[i].Date.split("-");
                var year = splitResults[0];
                var month = splitResults[1];
                var day = splitResults[2].substring(0, 2);

                if (selectedYear == year && selectedMonth == month && selectedDay == day) {
                    var div = document.createElement('div');
                    div.classList.add('custom-control');
                    div.classList.add('custom-radio');
                    div.classList.add('mx-1');

                    document.querySelector("#hoursDiv").appendChild(div);
                    div.innerHTML = "<input class='custom-control-input' type='radio' id='Reservation_" + Reservation.availableDates[i].Id + "' name='Reservation' value='" + Reservation.availableDates[i].Id + "' /><label class='custom-control-label' for='Reservation_" + Reservation.availableDates[i].Id + "'>" + Reservation.availableDates[i].Date.substring(11, 16) + "</label>";

                }
            }

            if (Reservation.availableDates.length == 0) {
                var label = document.createElement('label');
                label.innerHTML = Reservation.noReservationsMessage;
                document.querySelector("#hoursDiv").appendChild(label);
            }
        }
    },

    fillAvailableDates: function fillAvailableDates(year, month, parameter) {
        var postData = {
            productId: Reservation.productId,
            month: month,
            year: year,
            parameter: parameter
        };

        addAntiForgeryToken(postData);

        axios({
            url: Reservation.ajaxUrl,
            method: 'post',
            params: postData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            Reservation.currentMonth = month;
            Reservation.currentYear = year;
            Reservation.availableDates = response.data;
            Reservation._parameter = parameter;
        }).catch(function (error) {
            alert(error)
        })
    },

    fillAvailableDatesFrom: function fillAvailableDatesFrom(year, month) {
        var postData = {
            productId: Reservation.productId,
            month: month,
            year: year,
            parameter: null
        };
        addAntiForgeryToken(postData);

        axios({
            url: Reservation.ajaxUrl,
            method: 'post',
            params: postData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            Reservation.currentMonthFrom = month;
            Reservation.currentYearFrom = year;
            Reservation.availableDatesFrom = Reservation.availableDatesFrom.concat(response.data);
            return true;
        }).catch(function (error) {
            alert(error)
        })
    },

    fillAvailableDatesTo: function fillAvailableDatesTo(year, month) {
        var postData = {
            productId: Reservation.productId,
            month: month,
            year: year,
            parameter: null
        };

        addAntiForgeryToken(postData);

        axios({
            url: Reservation.ajaxUrl,
            method: 'post',
            params: postData,
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then(response => {
            Reservation.currentMonthTo = month;
            Reservation.currentYearTo = year;
            Reservation.availableDatesTo = Reservation.availableDatesTo.concat(response.data);
        }).catch(function (error) {
            alert(error)
        })
    },

    onDatePickerSelect: function onDatePickerSelect() {
        var form = document.querySelector('#product-details-form');
        var data = new FormData(form);
        axios({
            url: Reservation.ajaxUrl2,
            method: 'post',
            data: data,
        }).then(response => {
            if (response.data.sku) {
                document.querySelector("#sku-" + Reservation.productId).innerText = response.data.sku;
            }
            if (response.data.mpn) {
                document.querySelector("#mpn-" + Reservation.productId).innerText = response.data.mpn;
            }
            if (response.data.gtin) {
                document.querySelector("#gtin-" + Reservation.productId).innerText = response.data.gtin;
            }
            if (response.data.price) {
                document.querySelector(".price-value-" + Reservation.productId + " .actual-price").innerText = response.data.price;
            }
        })
    }
}

/* END RESERVATION */