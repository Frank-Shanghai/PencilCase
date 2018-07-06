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
        { text: "RetailWholesale", value: OrderTypes.RetailWholesale },
        { text: "Wholesale", value: OrderTypes.Wholesale },
        { text: "All", value: -1 },
    ];
    private selectedQuantitySaleType: KnockoutObservable<any> = ko.observable(OrderTypes.Retail);

    private orderRepository = new OrderRepository();
    private productRepository = new ProductRepository();

    private chartComponent;
    private chartPageTitle = ko.observable('');

    private customStartDate: string = '';
    private customEndDate: string = '';
    private isDatePickersInitialized = false;

    private isEmptyData: KnockoutObservable<boolean> = ko.observable(false);
    private chartSummary: KnockoutObservable<string> = ko.observable('');

    constructor() {
        super();
        this.title = ko.observable("Data Analyse");
        this.pageId = Consts.Pages.DataAnalyse.Id;

        this.selectedQuantitySaleType.subscribe((newValue: any) => {
            this.refreshChart();
        });
    }

    private refreshChart() {
        switch (this.chartDataType()) {
            case "Quantity":
                this.showQuantityChart();
                break;
            case "Total":
                this.showTotalChart();
                break;
            case "Profit":
                this.showProfitChart();
                break;
        }
    }

    public back = () => {
        if (this.isChartVisible()) {
            this.isChartVisible(false);

            this.customStartDate = '';
            this.customEndDate = '';

            // To hide custom datetime picker
            this.chartPageTitle(null);
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
                    this.showQuantityChart();
                }
                break;
            case "Total":
                if (this.chartDataType() !== "Total") {
                    this.showTotalChart();
                }

                break;
            case "Profit":
                if (this.chartDataType() !== "Profit") {
                    this.showProfitChart();
                }

                break;
        }
    }

    private showTodayChart() {
        this.chartTimespanOption = ChartTimespanOptions.Today;
        this.chartPageTitle("Today");

        this.showQuantityChart();
    }

    public showWeekChart() {
        this.chartTimespanOption = ChartTimespanOptions.Week;
        this.chartPageTitle("Week");
        this.showQuantityChart();
    }

    public showMonthChart() {
        this.chartTimespanOption = ChartTimespanOptions.Month;
        this.chartPageTitle("Month");
        this.showQuantityChart();
    }
    public showCustomChart() {
        this.chartTimespanOption = ChartTimespanOptions.CustomTime;
        this.chartPageTitle("Custom");
        this.customStartDate = moment(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD");
        this.customEndDate = moment(new Date(Date.now())).format("YYYY-MM-DD");

        let datePickerOptions = {
            format: 'YYYY-MM-DD',
            singleDatePicker: true,
            showDropdowns: true,
            autoUpdateInput: true,
            locale: {
                applyLabel: '确定',
                cancelLabel: '取消',
                daysOfWeek: ['日', '一', '二', '三', '四', '五', '六'],
                monthNames: ['一月', '二月', '三月', '四月', '五月', '六月',
                    '七月', '八月', '九月', '十月', '十一月', '十二月'],
                firstDay: 1
            },
            opens: "center"
        };

        if (this.isDatePickersInitialized === false) {
            $('input[name="startDate"]').daterangepicker($.extend(datePickerOptions, {
                startDate: moment(new Date(this.customStartDate)).format("MM/DD/YYYY")
            }), (start, end, label) => {
                this.customStartDate = start.format('YYYY-MM-DD');
            });

            $('input[name="endDate"]').daterangepicker($.extend(datePickerOptions, {
                startDate: moment(new Date(this.customEndDate)).format("MM/DD/YYYY")
            }), (start, end, label) => {
                this.customEndDate = start.format('YYYY-MM-DD');
            });

            this.isDatePickersInitialized = true;
        }

        this.showQuantityChart();
    }

    private showTotalChart() {
        this.chartDataType("Total");
        this.isChartVisible(true);
        let timeSpanString = this.getTimespanStringByOption(this.chartTimespanOption);

        let labels = [];
        let data = [];
        let chartTotal = 0;
        this.orderRepository.getOrdersForDataAnalyse(timeSpanString, this.selectedQuantitySaleType() != -1, this.selectedQuantitySaleType(), (transaction: SqlTransaction, orderSet: SqlResultSet) => {
            if (orderSet.rows.length > 0) {
                this.isEmptyData(false);
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

                        data.push(order.Total);
                        chartTotal += order.Total;

                        if (rows.length - 1 == i) {
                            this.chartSummary("总计：" + chartTotal + "元");
                            this.initializeChart(labels, data);
                        }
                    }, this.onDBError);
                }
            }
            else {
                this.isEmptyData(true);
            }
        }, this.onDBError);
    }

    private showProfitChart() {
        this.chartDataType("Profit");
        this.isChartVisible(true);
        let timeSpanString = this.getTimespanStringByOption(this.chartTimespanOption);

        let labels = [];
        let data = [];
        let total = 0;
        if (this.selectedQuantitySaleType() != -1) {
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, this.selectedQuantitySaleType(), (transaction: SqlTransaction, orderSet: SqlResultSet) => {
                if (orderSet.rows.length > 0) {
                    this.isEmptyData(false);
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
                                let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].WholesaleCost)).toFixed(2));
                                data.push(value);
                                total += value;
                            }
                            else {
                                let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                data.push(value);
                                total += value;
                            }

                            if (rows.length - 1 == i) {
                                this.chartSummary("总计：" + total + "元");
                                this.initializeChart(labels, data);
                            }
                        }, this.onDBError);
                    }
                }
                else {
                    this.isEmptyData(true);
                }
            }, this.onDBError);
        }
        else {
            let handleWholesale = () => {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, OrderTypes.Wholesale, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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
                                    let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].WholesaleCost)).toFixed(2));
                                    data[index] = data[index] + value;
                                    total += value;
                                }
                                else {
                                    let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].WholesaleCost)).toFixed(2));
                                    data.push(value);
                                    total += value;
                                }

                                if (rows.length - 1 == i) {
                                    this.isEmptyData(false);
                                    this.initializeChart(labels, data);
                                    this.chartSummary("总计：" + total + "元");
                                }
                            }, this.onDBError);
                        }
                    }
                    else {
                        if (total > 0) {
                            this.isEmptyData(false);
                            this.initializeChart(labels, data);
                            this.chartSummary("总计：" + total + "元");
                        }
                        else {
                            this.isEmptyData(true);
                        }
                    }
                }, this.onDBError);
            };

            let handleRetailWholesaleAndWholesale = () => {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, OrderTypes.RetailWholesale, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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

                                //retailWholesale
                                if (productExisted === true) {
                                    // When calculating profict, use retail cost
                                    let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                    data[index] = data[index] + value;
                                    total += value;
                                }
                                else {
                                    let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                    data.push(value);
                                    total += value;
                                }

                                if (rows.length - 1 == i) {
                                    handleWholesale();
                                }
                            }, this.onDBError);
                        }
                    }
                    else {
                        handleWholesale();
                    }
                }, this.onDBError);
            };


            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, OrderTypes.Retail, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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
                            let value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                            data.push(value);

                            if (rows.length - 1 == i) {
                                handleRetailWholesaleAndWholesale();
                            }
                        }, this.onDBError);
                    }
                }
                else {
                    handleRetailWholesaleAndWholesale();
                }
            }, this.onDBError);
        }
    }

    public showQuantityChart() {
        this.chartDataType("Quantity");
        this.isChartVisible(true);
        let timeSpanString = this.getTimespanStringByOption(this.chartTimespanOption);

        let labels = [];
        let data = [];
        let total = 0;
        if (this.selectedQuantitySaleType() != -1) {
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, this.selectedQuantitySaleType(), (transaction: SqlTransaction, orderSet: SqlResultSet) => {
                if (orderSet.rows.length > 0) {
                    this.isEmptyData(false);
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
                                let value = order.Quantity * productSet.rows[0].Times;
                                data.push(value);
                                total += value;
                            }
                            else {
                                data.push(order.Quantity);
                                total += order.Quantity;
                            }

                            if (rows.length - 1 == i) {
                                this.chartSummary("总计：" + total);
                                this.initializeChart(labels, data);
                            }
                        }, this.onDBError);
                    }
                }
                else {
                    this.isEmptyData(true);
                }
            }, this.onDBError);
        }
        else {
            // Finally, handle wholesale
            let handleWholesale = () => {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, OrderTypes.Wholesale, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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
                                    total += (order.Quantity * productSet.rows[0].Times);
                                }
                                else {
                                    data.push(order.Quantity * productSet.rows[0].Times);
                                    total += (order.Quantity * productSet.rows[0].Times);
                                }

                                if (rows.length - 1 == i) {
                                    this.isEmptyData(false);
                                    this.chartSummary("总计：" + total);
                                    this.initializeChart(labels, data);
                                }
                            }, this.onDBError);
                        }
                    }
                    else {
                        if (total > 0) {
                            this.isEmptyData(false);
                            this.chartSummary("总计：" + total);
                            this.initializeChart(labels, data);
                        }
                        else {
                            this.isEmptyData(true);
                        }
                    }
                }, this.onDBError);
            };

            // Second, handle retailWholesale
            let handleRetailWholesaleAndWholesale = () => {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, OrderTypes.RetailWholesale, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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

                                //retailWholesale
                                if (productExisted === true) {
                                    data[index] = data[index] + order.Quantity;
                                    total += order.Quantity;
                                }
                                else {
                                    data.push(order.Quantity);
                                    total += order.Quantity;
                                }

                                if (rows.length - 1 == i) {
                                    handleWholesale();
                                }
                            }, this.onDBError);
                        }
                    }
                    else {
                        handleWholesale();
                    }
                }, this.onDBError);
            };

            // First, handle retail
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, OrderTypes.Retail, (transaction: SqlTransaction, orderSet: SqlResultSet) => {
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
                            total += order.Quantity;

                            if (rows.length - 1 == i) {
                                handleRetailWholesaleAndWholesale();
                            }
                        }, this.onDBError);
                    }
                }
                else {
                    handleRetailWholesaleAndWholesale();
                }
            }, this.onDBError);

        }
    }

    private initializeChart = (labels: Array<any>, data: Array<any>) => {
        var ctx = (<any>(document.getElementById("dataChart"))).getContext("2d");

        //Why have to make the todayChart as a class scoped variable
        //https://github.com/chartjs/Chart.js/issues/350
        if (this.chartComponent)
            this.chartComponent.destroy();

        this.chartComponent = new Chart(ctx, {
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

    private getTimespanStringByOption(option: ChartTimespanOptions) {
        let timeSpanString = '';
        switch (option) {
            case ChartTimespanOptions.Today:
                timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now())).format("YYYY-MM-DD") + "' ";
                break;
            case ChartTimespanOptions.Week:
                timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' and CreatedDate < '" + moment(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' ";
                break;
            case ChartTimespanOptions.Month:
                timeSpanString = " CreatedDate >= '" + moment(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' and CreatedDate < '" + moment(new Date(Date.now() + 1 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' ";
                break;
            case ChartTimespanOptions.CustomTime:
                if (this.customStartDate && this.customEndDate) {
                    timeSpanString = "CreatedDate >= '" + this.customStartDate + "' and CreatedDate < '" + moment(new Date(new Date(this.customEndDate).getTime() + 1 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD") + "' ";
                }
                break;
        }

        return timeSpanString;
    }

}

enum ChartTimespanOptions {
    Today = 1,
    Week,
    Month,
    CustomTime,
}