class buy {
    parent_op = null;

    selected_times = 1
    selected_payment = 'cny'
    selected_type = 'addon'
    selected_code = 'HS'
    selected_price = 0
    selected_dom_code = null
    selected_dom_time = null
    selected_dom_payment = null
    payment_price = 0

    init(op) {
        this.parent_op = op;
    }

    setAvaliablePayment() {
        console.log(this.parent_op.currentLanguage);
        //根据语言设定可用的支付方式
        if (this.parent_op.currentLanguage !== 'cn') {
            this.selectPayment('usd');
            $('.buy_payment_cny').hide();
        } else {
            this.selectPayment('cny');
            $('.buy_payment_cny').show();
        }
    }

    openQuato() {
        this.selected_times = 1;
        this.selected_type = 'direct';
        this.setAvaliablePayment();
        this.selectNums();
        this.selectCode('#buy_direct_quota_1', 'D20', 6);
        $('#shopModal').modal('hide');
        setTimeout(() => {
            $('#directQuotaModal').modal('show');
        }, 100);
    }

    openStorage() {
        this.selectTime('a');
        this.setAvaliablePayment();
        this.selected_type = 'addon';
        this.selectCode('#buy_storage_256', '256GB', 6);
        $('#shopModal').modal('hide');
        $('#uploadModal').modal('hide');
        $('#myModal').modal('hide');
        setTimeout(() => {
            $('#storageModal').modal('show');
        }, 100);
    }

    openSponsor() {
        this.selected_type = 'addon';
        this.selected_price = 6;
        this.selectTime('a');
        this.setAvaliablePayment();
        this.selected_code = 'HS';
        $('#shopModal').modal('hide');
        $('#myModal').modal('hide');
        setTimeout(() => {
            $('#sponsorModal').modal('show');
        }, 100);
    }

    selectCode(dom, code, price) {
        this.selected_code = code;
        this.selected_price = price;
        if (this.selected_dom_code !== null) {
            document.querySelector(this.selected_dom_code).classList.remove('card-selected');
        }
        this.selected_dom_code = dom;
        document.querySelector(this.selected_dom_code).classList.add('card-selected');
        this.computePrice();
    }

    selectTime(time) {
        this.selected_times = time == 'a' ? 1 : 10;
        if (time === 'a') {
            document.querySelectorAll('.pay_times_a').forEach((item) => {
                item.classList.add('card-selected');
            });
            document.querySelectorAll('.pay_times_b').forEach((item) => {
                item.classList.remove('card-selected');
            });
        } else {
            document.querySelectorAll('.pay_times_a').forEach((item) => {
                item.classList.remove('card-selected');
            });
            document.querySelectorAll('.pay_times_b').forEach((item) => {
                item.classList.add('card-selected');
            });
        }
        this.computePrice();
    }

    selectNums() {
        let nums = document.querySelector('#buy_direct_quota_nums').value;
        nums = parseInt(nums);
        if (nums > 0) {
            this.selected_times = nums;
            this.computePrice();
        } else {
            this.selected_times = 1;
            this.computePrice();
        }
    }

    selectPayment(payment) {
        this.selected_payment = payment == 'cny' ? 'cny' : 'usd';
        const cnyCards = document.querySelectorAll('.buy_payment_cny > .card');
        const usdCards = document.querySelectorAll('.buy_payment_usd > .card'); // 假设 USD 也应该选择 .card
        const isSelected = payment === 'cny';
        cnyCards.forEach(card => card.classList.toggle('card-selected', isSelected));
        usdCards.forEach(card => card.classList.toggle('card-selected', !isSelected));
        this.computePrice();
    }

    computePrice() {
        let price = 0;

        if (this.selected_payment === 'cny') {
            $('.payment_units').html(app.languageData.payment_cny);
            price = this.selected_price * this.selected_times;
        } else {
            $('.payment_units').html(app.languageData.payment_usd);
            price = (this.selected_price / 6) * this.selected_times;
        }
        this.payment_price = price;
        $('.payment_total').html(price);
    }

    makeOrder() {
        let payURL = '';
        if (this.selected_payment == 'cny') {
            payURL = `https://pay.vezii.com/id4/pay_v2?price=${this.payment_price}&token=${this.parent_op.api_token}&prepare_type=${this.selected_type}&prepare_code=${this.selected_code}&prepare_times=${this.selected_times}`;
        } else {
            payURL = `https://s12.tmp.link/payment/paypal/checkout_v2?price=${this.payment_price}&token=${this.parent_op.api_token}&prepare_type=${this.selected_type}&prepare_code=${this.selected_code}&prepare_times=${this.selected_times}`;
        }
        window.location.href = payURL;
    }
}