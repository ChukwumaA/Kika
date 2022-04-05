const Flutterwave = require('flutterwave-node-v3');
const open = require('open');

const flw = new Flutterwave(process.env.PUBLIC_KEY, process.env.SECRET_KEY);
   
const payload = {
    "card_number": "5531886652142950",
    "cvv": "564",
    "expiry_month": "09",
    "expiry_year": "21",
    "currency": "NGN",
    "amount": "100",
    "redirect_url": "https://www.google.com",
    "fullname": "Adeyinka Chinenye",
    "email": "adeyinkachinenye@flw.com",
    "phone_number": "0902620185",
    "enckey": "FLWSECK_TESTbf1b28c2eb39",
    "tx_ref": "MC-32444ee--4eerye4euee3rerds4423e43e", // This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.

};

// @desc    charges nigerian bank account
// @route   POST/api/v1/fromCard/flutterwave
// @access  Private   
exports.chargeCard = async () => {
    try {
        const response = await flw.Charge.card(payload)
        console.log(response)
        if (response.meta.authorization.mode === 'pin') {
            let payload2 = payload
            payload2.authorization = {
                "mode": "pin",
                "fields": [
                    "pin"
                ],
                "pin": 3310
            }
            const reCallCharge = await flw.Charge.card(payload2)

            const callValidate = await flw.Charge.validate({
                "otp": "12345",
                "flw_ref": reCallCharge.data.flw_ref
            })
            console.log(callValidate)

        }
        if (response.meta.authorization.mode === 'redirect') {

            var url = response.meta.authorization.redirect
            open(url)
        }

        console.log(response)


    } catch (error) {
        console.log(error)
    }
}

// @desc    charges nigerian bank account
// @route   POST/api/v1/fromBank/flutterwave
// @access  Private 
exports.charge_ng_acct = async () => {
    try {
        const payloadNG = {
            "tx_ref": "MC-1585dshdhdsdv5050e8", //This is a unique reference, unique to the particular transaction being carried out. It is generated when it is not provided by the merchant for every transaction.
            "amount": "100", //This is the amount to be charged.
            "account_bank": "044", //This is the Bank numeric code. You can get a list of supported banks and their respective codes Here: https://developer.flutterwave.com/v3.0/reference#get-all-banks
            "account_number": "0690000037",
            "currency": "NGN",
            "email": "olufemi@flw.com",
            "phone_number": "0902620185", //This is the phone number linked to the customer's mobile money account
            "fullname": "Olufemi Obafunmiso"
        }

        const response = await flw.Charge.ng(payloadNG)
        console.log(response);
    } catch (error) {
        console.log(error)
    } ; 

}



