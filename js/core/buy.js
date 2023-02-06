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
    
    init(op){
        this.parent_op = op;
    }

    openQuato(){
        this.selected_times = 1;
        this.selected_type = 'direct';
        this.selectPayment('cny');
        this.selectCode('#buy_direct_quota_1','D20',6);
        $('#shopModal').modal('hide');
        setTimeout(()=>{
            $('#directQuotaModal').modal('show');
        },300);
    }

    openStorage(){
        this.selectTime('a');
        this.selectPayment('cny');
        this.selected_type = 'addon';
        this.selectCode('#buy_storage_256','256GB',6);
        $('#shopModal').modal('hide');
        setTimeout(()=>{
            $('#storageModal').modal('show');
        },300);
    }

    openSponsor(){
        this.selected_type = 'addon';
        this.selected_price = 6;
        this.selectTime('a');
        this.selectPayment('cny');
        this.selected_code = 'HS';
        $('#shopModal').modal('hide');
        setTimeout(()=>{
            $('#sponsorModal').modal('show');
        },300);
    }

    selectCode(dom,code,price){
        this.selected_code = code;
        this.selected_price = price;
        if(this.selected_dom_code!==null){
            document.querySelector(this.selected_dom_code).classList.remove('card-selected');
        }
        this.selected_dom_code = dom;
        document.querySelector(this.selected_dom_code).classList.add('card-selected');
        this.computePrice();
    }

    selectTime(time){
        this.selected_times = time =='a'?1:10;
        if(time==='a'){
            document.querySelectorAll('.pay_times_a').forEach((item)=>{
                item.classList.add('card-selected');
            });
            document.querySelectorAll('.pay_times_b').forEach((item)=>{
                item.classList.remove('card-selected');
            });
        }else{
            document.querySelectorAll('.pay_times_a').forEach((item)=>{
                item.classList.remove('card-selected');
            });
            document.querySelectorAll('.pay_times_b').forEach((item)=>{
                item.classList.add('card-selected');
            });
        }
        this.computePrice();
    }

    selectPayment(payment){
        this.selected_payment = payment=='cny'? 'cny':'usd';
        if(payment==='cny'){
            document.querySelectorAll('.buy_payment_cny').forEach((item)=>{
                item.classList.add('card-selected');
            });
            document.querySelectorAll('.buy_payment_usd').forEach((item)=>{
                item.classList.remove('card-selected');
            });
        }else{
            document.querySelectorAll('.buy_payment_cny').forEach((item)=>{
                item.classList.remove('card-selected');
            });
            document.querySelectorAll('.buy_payment_usd').forEach((item)=>{
                item.classList.add('card-selected');
            });
        }
        this.computePrice();
    }

    computePrice(){
        let price = 0;

        if(this.selected_payment==='cny'){
            $('.payment_units').html(app.languageData.payment_cny);
            price = this.selected_price * this.selected_times;
        }else{
            $('.payment_units').html(app.languageData.payment_usd);
            price = (this.selected_price / 6) * this.selected_times;
        }
        this.payment_price = price;
        $('.payment_total').html(price);
    }

    makeOrder(){
        let payURL = '';
        if (this.selected_payment == 'cny') {
            payURL = `https://pay.vezii.com/id4/pay_v2?price=${this.payment_price}&token=${this.parent_op.api_token}&prepare_type=${this.selected_type}&prepare_code=${this.selected_code}&prepare_times=${this.selected_times}`;
        } else {
            payURL = `https://s12.tmp.link/payment/paypal/checkout_v2?price=${this.payment_price}&token=${this.parent_op.api_token}&prepare_type=${this.selected_type}&prepare_code=${this.selected_code}&prepare_times=${this.selected_times}`;
        }
        window.location.href = payURL;
    }
}