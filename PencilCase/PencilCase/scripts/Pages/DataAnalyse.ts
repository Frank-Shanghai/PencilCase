import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
import { OrderTypes } from '../Models/Order';
import { OrderRepository } from '../Repositories/OrderRepository';
import { ProductRepository } from '../Repositories/ProductRepository';

declare var palette: any;

export class DataAnalyse extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private isChartVisible: KnockoutObservable<boolean> = ko.observable(false);
    private chartTimespanOption: ChartTimespanOptions;
    private chartDataType: KnockoutObservable<string> = ko.observable("Quantity");
    private quantitySaleTypeOptinos = [
        { text: "Retail", value: OrderTypes.Retail },
        { text: "Wholesale", value: OrderTypes.Wholesale },
        { text: "Both", value: -1 }
    ];
    private selectedQuantitySaleType: KnockoutObservable<any> = ko.observable(OrderTypes.Retail);

    private orderRepository = new OrderRepository();
    private productRepository = new ProductRepository();

    private todayChart;

    constructor() {
        super();
        this.title = ko.observable("Data Analyse");
        this.pageId = Consts.Pages.DataAnalyse.Id;

        this.selectedQuantitySaleType.subscribe((newValue: any) => {
            this.showQuantityChart();
        });
    }

    public back = () => {
        if (this.isChartVisible()) {
            this.isChartVisible(false);
        }
        else {
            this.navigator.goHome();
        }
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError) => {
        alert("Data Analyse Page: " + sqlError.message);
    }

    private setChartDataType = (dataType: string) => {
        switch (dataType) {
            case "Quantity":
                if (this.chartDataType() !== "Quantity") {
                    this.chartDataType("Quantity");
                    this.showQuantityChart();
                }
                break;
            case "Total":
                if (this.chartDataType() !== "Total") {
                    this.chartDataType("Total");
                    this.showTotalChart();
                }

                break;
            case "Profit":
                if (this.chartDataType() !== "Profit") {
                    this.chartDataType("Profit");
                    this.showProfitChart();
                }

                break;
        }
    }

    private showTodayChart() {        
        this.chartTimespanOption = ChartTimespanOptions.Today;
        this.showQuantityChart();
    }

    public showWeekChart() {
        this.chartTimespanOption = ChartTimespanOptions.Week;
        this.showQuantityChart();

    }

    public showMonthChart() {
        this.chartTimespanOption = ChartTimespanOptions.Month;
        this.showQuantityChart();

    }
    public showCustomChart() {
        //this.chartTimespanOption = ChartTimespanOptions.Today;
        //this.showQuantityChart();
    }


    private showTotalChart() {
        alert("total chart");
    }

    private showProfitChart() {
        alert("profict chart");
    }

    public showQuantityChart() {
        this.chartDataType("Quantity");
        this.isChartVisible(true);

        let timeSpanString = '';
        switch (this.chartTimespanOption) {
            case ChartTimespanOptions.Today:
                timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now())).format("YYYY-MM-DD") + "' ";
                break;
            case ChartTimespanOptions.Week:
                timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' and CreatedDate < '" + moment(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' ";
                break;
            case ChartTimespanOptions.Month:
                timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' and CreatedDate < '" + moment(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' ";
                break;
        }        

        let labels = [];
        let data = [];
        if (this.selectedQuantitySaleType() != -1) {
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, this.selectedQuantitySaleType(), (transaction: SqlTransaction, orderSet: SqlResultSet) => {
                if (orderSet.rows.length > 0) {
                    let rows = orderSet.rows;
                    for (let i = 0; i < rows.length; i++) {
                        let order = rows[i];
                        this.productRepository.getProductById(order.ProductId, (transaction: SqlTransaction, productSet: SqlResultSet) => {
                            if (productSet.rows.length > 0) {
                                labels.push(productSet.rows[0].Name);
                            }
                            else {
                                labels.push("unknown" + i);
                            }

                            //wholesale
                            if (order.Type == 2) {
                                data.push(order.Quantity * productSet.rows[0].Times);
                            }
                            else {
                                data.push(order.Quantity);
                            }

                            if (rows.length - 1 == i) {
                                initializeChart();
                            }
                        }, this.onDBError);
                    }
                }
            }, this.onDBError);
        }
        else {
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, OrderTypes.Retail, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
                if (orderSet.rows.length > 0) {
                    let rows = orderSet.rows;
                    for (let i = 0; i < rows.length; i++) {
                        let order = rows[i];
                        this.productRepository.getProductById(order.ProductId, (transaction: SqlTransaction, productSet: SqlResultSet) => {
                            if (productSet.rows.length > 0) {
                                labels.push(productSet.rows[0].Name);
                            }
                            else {
                                labels.push("unknown" + i);
                            }

                            //retail
                            data.push(order.Quantity);

                            if (rows.length - 1 == i) {
                                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, OrderTypes.Wholesale, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
                                    if (orderSet.rows.length > 0) {
                                        let rows = orderSet.rows;
                                        for (let i = 0; i < rows.length; i++) {
                                            let order = rows[i];
                                            this.productRepository.getProductById(order.ProductId, (transaction: SqlTransaction, productSet: SqlResultSet) => {
                                                let productExisted = false;
                                                let index = -1;
                                                if (productSet.rows.length > 0) {
                                                    index = labels.indexOf(productSet.rows[0].Name);
                                                    if (index < 0) {
                                                        labels.push(productSet.rows[0].Name);
                                                    }
                                                    else {
                                                        productExisted = true;
                                                    }
                                                }
                                                else {
                                                    labels.push("unknown" + i);
                                                }

                                                //wholesale
                                                if (productExisted === true) {
                                                    data[index] = data[index] + (order.Quantity * productSet.rows[0].Times);
                                                }
                                                else {
                                                    data.push(order.Quantity * productSet.rows[0].Times);
                                                }

                                                if (rows.length - 1 == i) {
                                                    initializeChart();
                                                }
                                            }, this.onDBError);
                                        }
                                    }
                                }, this.onDBError);

                            }
                        }, this.onDBError);
                    }
                }
            }, this.onDBError);

        }

        let initializeChart = () => {
            var ctx = (<any>(document.getElementById("dataChart"))).getContext("2d");

            //Why have to make the todayChart as a class scoped variable
            //https://github.com/chartjs/Chart.js/issues/350
            if (this.todayChart)
                this.todayChart.destroy();

            this.todayChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Retail Quantity',
                        data: data,
                        backgroundColor: palette('tol', data.length).map(function (hex) {
                            return '#' + hex;
                        })
                    }]
                }
            });
        }
    }

}

enum ChartTimespanOptions {
    Today = 1,
    Week,
    Month,
    CustomTime,
}