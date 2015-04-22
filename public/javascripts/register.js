var codes = { 
    'FAILED' : '1',
    'OK' : '0'
};

var formSuccess;

$(document).ready(function() {
    console.log('hello there');
    // Register elements
    $('#phoneNumber').intlTelInput({
        utilsScript: '/javascripts/telUtils.js',
        onlyCountries: ['us']
    });

    $('#registerForm').submit(function(e) {
        e.preventDefault();

        console.log('inside onsubmit function');
        $('#errorList').empty();
        registerFormSubmit();
        if(!formSuccess) $('#errorMessage').removeClass('hidden');
        else $('#errorMessage').addClass('hidden');
    });
});

function removeErrorFields() {
    $('.field').each(function(i, obj) {
        $(obj).removeClass('error');
    });
}

function registerFormSubmit() {
    formSuccess = true;

    // Get values from form
    var email = $('[name="email"]')
      , password = $('[name="password"]')
      , firstName = $('[name="firstName"]')
      , lastName = $('[name="lastName"]')
      , phoneNumber = $('#phoneNumber')
      , deviceNumber = $('[name="deviceNumber"]');

    console.log('email: ' +email.val());
    console.log('password: ' +password.val());
    console.log('firstName: ' +firstName.val());
    console.log('lastName: ' +lastName.val());
    console.log('phoneNumber: ' +phoneNumber.intlTelInput('getNumber'));
    console.log('deviceNumber: ' +deviceNumber.val());

    // Pre-post validation
    if(emailLen()) addErrorPre('Please enter your email', $('#emailField'), email, emailLen);
    if(passLen()) addErrorPre('Please enter your password', $('#passwordField'), password, passLen);
    else if(passLenSix()) addErrorPre('Your password must be at least 6 characters long', $('#passwordField'), password, passLenSix);
    // console.log('passlensix: ' + passLenSix());
    if(fnameLen()) addErrorPre('Please enter your first name', $('#fnameField'), firstName, fnameLen);
    if(lnameLen()) addErrorPre('Please enter your last name', $('#lnameField'), lastName, lnameLen);
    if(phoneLen()) addErrorPre('Please enter your phone number', $('#phoneField'), phoneNumber, phoneLen);
    else if(phoneVal()) addErrorPre('Please enter a valid phone number', $('#phoneField'), phoneNumber, phoneVal);    
    if(deviceLen()) addErrorPre('Please enter your device number', $('#deviceField'), deviceNumber, deviceLen);

    if(formSuccess) {
        removeErrorFields();
        // Post validation
        console.log('posting!');
        var toSend = {
            email: email.val(),
            password: password.val(),
            firstName: firstName.val(),
            lastName: lastName.val(),
            phoneNumber: phoneNumber.intlTelInput('getNumber'),
            deviceNumber: deviceNumber.val()
        }

        $.post('/register', toSend , function(data, stat, xhr) {
            console.log('here');
            if(data.status == codes.FAIL) {
                console.log(data.info);

                if(data.info.field == 'email') addError(data.info.message, $('#emailField'));
                else if (data.info.field == 'device') addError(data.info.message, $('#deviceField'));
                else if (data.info.field == 'phone') addError(data.info.message, $('#phoneField'));
                else addError(data.info.message, null);
                $('#errorMessage').removeClass('hidden');
            } else {
                window.location.replace('/home');
            }
        });
    }         
}

function addErrorPre(msg, field, input, cmp) {
    addError(msg, field);
    input.blur(function() {
        if(!cmp()) {
            field.removeClass('error');
            input.unbind('blur');
        }
    })
    input.keypress(function() {
        if(!cmp()) {
            field.removeClass('error');
            // Check for phone because it unbinds the intlTel module
            if(!input == $('#phoneNumber')) input.unbind('keypress');
        }
    })
}

function addError(msg, field) {
    formSuccess = false;
    var err = document.createElement('li');
    err.innerHTML = msg; 
    $('#errorList').append(err);
    if(field != null) field.addClass('error');
}

function emailLen() { return $('[name="email"]').val().length <= 0 }
function passLen() { return $('[name="password"]').val().length <= 0 }
function passLenSix() { return $('[name="password"]').val().length < 6 }
function fnameLen() { return $('[name="firstName"]').val().length <= 0 }
function lnameLen() { return $('[name="lastName"]').val().length <= 0 }
function phoneLen() { return $('#phoneNumber').intlTelInput('getNumber').length <= 0 }
function phoneVal() { return !$('#phoneNumber').intlTelInput('isValidNumber'); }
function deviceLen() { return $('[name="deviceNumber"]').val().length <= 0 }