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
    
    // 初次赞助特典相关
    firstTimeSponsorAvailable = false

    init(op) {
        this.parent_op = op;
        this.checkFirstTimeSponsor();
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

    /**
     * 当shopModal显示时重新检查初次赞助特典
     */
    onShopModalShow() {
        this.checkFirstTimeSponsor();
    }

    /**
     * 当shopModal隐藏时，也要确保红色提示点保持正确状态
     */
    onShopModalHide() {
        // Modal隐藏时不需要特别处理，保持当前状态即可
    }

    openBlackFriday() {
        this.selected_type = 'addon';
        this.selected_price = 36;
        this.selectTime('a');
        this.setAvaliablePayment();
        this.selected_code = 'BF';
        $('#blackfridayModal').modal('show');
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

    /**
     * 检查用户是否可以购买初次赞助特典
     */
    async checkFirstTimeSponsor() {
        if (!this.parent_op.api_token) {
            return;
        }

        try {
            const response = await fetch(this.parent_op.api_pay, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: `action=limit_product_check&token=${this.parent_op.api_token}&code=FN01`
            });

            const data = await response.json();
            if (data.status === 1) {
                this.firstTimeSponsorAvailable = true;
                this.showFirstTimeSponsorOption();
            } else {
                this.firstTimeSponsorAvailable = false;
                this.hideFirstTimeSponsorOption();
            }
        } catch (error) {
            console.error('检查初次赞助特典失败:', error);
            this.firstTimeSponsorAvailable = false;
            this.hideFirstTimeSponsorOption();
        }
    }

    /**
     * 显示初次赞助特典选项
     */
    showFirstTimeSponsorOption() {
        const firstTimeSponsorOption = document.getElementById('firstTimeSponsorOption');
        if (firstTimeSponsorOption) {
            firstTimeSponsorOption.style.display = 'block';
            this.updateFirstTimeSponsorPrice();
        }
        this.showShopBadge();
    }

    /**
     * 更新初次赞助特典价格显示
     */
    updateFirstTimeSponsorPrice() {
        const priceElement = document.getElementById('firstTimeSponsorPrice');
        if (priceElement) {
            if (this.parent_op.currentLanguage === 'cn' || this.parent_op.currentLanguage === 'jp') {
                priceElement.textContent = '36';
            } else {
                priceElement.textContent = '6';
            }
        }
    }

    /**
     * 当语言切换时，更新价格显示
     */
    onLanguageChange() {
        if (this.firstTimeSponsorAvailable) {
            this.updateFirstTimeSponsorPrice();
        }
    }

    /**
     * 隐藏初次赞助特典选项
     */
    hideFirstTimeSponsorOption() {
        const firstTimeSponsorOption = document.getElementById('firstTimeSponsorOption');
        if (firstTimeSponsorOption) {
            firstTimeSponsorOption.style.display = 'none';
        }
        this.hideShopBadge();
    }

    /**
     * 购买初次赞助特典
     */
    buyFirstTimeSponsor() {
        if (!this.firstTimeSponsorAvailable) {
            return;
        }

        let price = 36;
        // 根据语言设置价格：中文/日文36元，其他语言6美元等值
        if (this.parent_op.currentLanguage === 'cn' || this.parent_op.currentLanguage === 'jp') {
            price = 36; // 人民币/日元
        } else {
            price = 6;  // 美元等值，支付宝会自动转换
        }
        
        // 只使用支付宝支付
        const payURL = `https://pay.vezii.com/id4/pay_v2?price=${price}&token=${this.parent_op.api_token}&prepare_type=addon&prepare_code=FN01&prepare_times=1`;
        window.location.href = payURL;
    }

    /**
     * 显示商店红色提示点
     */
    showShopBadge() {
        // 显示所有商店按钮的红色提示点
        const badges = document.querySelectorAll('#shopBadge, #shopBadgeMobile');
        badges.forEach(badge => {
            if (badge) {
                badge.style.display = 'inline-block';
            }
        });
    }

    /**
     * 隐藏商店红色提示点
     */
    hideShopBadge() {
        // 隐藏所有商店按钮的红色提示点
        const badges = document.querySelectorAll('#shopBadge, #shopBadgeMobile');
        badges.forEach(badge => {
            if (badge) {
                badge.style.display = 'none';
            }
        });
    }
}