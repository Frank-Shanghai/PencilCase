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
    private chartOption: ChartOptions;
    private todaySaleTypeOptinos = [
        { text: "Retail", value: OrderTypes.Retail },
        { text: "Wholesale", value: OrderTypes.Wholesale },
        { text: "Both", value: -1 }
    ];
    private selectedTodaySaleType: KnockoutObservable<any> = ko.observable(OrderTypes.Retail);

    private orderRepository = new OrderRepository();
    private productRepository = new ProductRepository();

    private todayChart;

    constructor() {
        super();
        this.title = ko.observable("Data Analyse");
        this.pageId = Consts.Pages.DataAnalyse.Id;

        this.selectedTodaySaleType.subscribe((newValue: any) => {
            this.showTodayChart();
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

    public showTodayChart() {
        this.isChartVisible(true);
        this.chartOption = ChartOptions.Today;
        let timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now())).format("YYYY-MM-DD") + "' ";

        let labels = [];
        let data = [];
        if (this.selectedTodaySaleType() != -1) {
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, this.selectedTodaySaleType(), (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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
            var ctx = (<any>(document.getElementById("todayChart"))).getContext("2d");

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

    public showWeekChart() { }
    public showMonthChart() { }
    public showCustomChart() { }
}

enum ChartOptions {
    Today = 1,
    Week,
    Month,
    CustomTime,
}