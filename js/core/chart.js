class chart {
    parent_op = null

    init(parent_op) {
        this.parent_op = parent_op;
    }

    openAnalytics(){
        this.generateDownload(0);
        this.generateDownloadHot(0);
        $('#downloadLogModal').modal('show');
    }

    generateDownload(rt){
        //构建请求
        let post = {
            token: this.parent_op.api_token,
            rt: rt,
            action: 'list_download_chart'
        };
        //请求数据
        $.post(this.parent_op.api_file, post, (rsp) => {
            var options = {
                series: [{
                    name: '下载次数',
                    data: rsp.data.data
                }],
                chart: {
                    id: 'download_log',
                    height: 200,
                    type: 'area',
                    animations: {
                        enabled: false,
                    },
                    toolbar: {
                        show: false
                    },
                    zoom: {
                        enabled: false
                    },
                    offsetX: 0, // 取消x轴偏移
                    offsetY: 0, // 取消y轴偏移
                    sparkline: {
                        enabled: true
                    },
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: 1,
                    curve: 'straight'
                },
                xaxis: {
                    categories: rsp.data.time, // 生成 60 至 1 s 的数组
                    labels: {
                        show: false
                    },
                    axisBorder: {
                        show: false
                    },
                    axisTicks: {
                        show: false
                    }
                },
                yaxis: {
                    labels: {
                        show: true
                    },
                    show: true,
                },
                grid: {
                    show: true,
                },
            };
    
            this.speed_chart = new ApexCharts(document.querySelector("#dl_c_chart1"), options);
            this.speed_chart.render();
        },'json');
    }

    generateDownloadHot(rt){
        //构建请求
        let post = {
            token: this.parent_op.api_token,
            rt: rt,
            action: 'list_download_hot'
        };
        //请求数据
        $.post(this.parent_op.api_file, post, (rsp) => {
            let html = app.tpl('download_hot_list_tpl', rsp.data);
            $('#download_hot_list').html(html);
        },'json');
    }
}