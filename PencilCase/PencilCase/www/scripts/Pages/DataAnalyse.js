var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "./PageBase", "../Navigator", "./Consts", "../Models/Order", "../Repositories/OrderRepository", "../Repositories/ProductRepository"], function (require, exports, PageBase_1, Navigator_1, Consts, Order_1, OrderRepository_1, ProductRepository_1) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DataAnalyse = (function (_super) {
        __extends(DataAnalyse, _super);
        function DataAnalyse() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.isChartVisible = ko.observable(false);
            _this.chartDataType = ko.observable("Quantity");
            _this.quantitySaleTypeOptinos = [
                { text: "Retail", value: Order_1.OrderTypes.Retail },
                { text: "Wholesale", value: Order_1.OrderTypes.Wholesale },
                { text: "Both", value: -1 }
            ];
            _this.selectedQuantitySaleType = ko.observable(Order_1.OrderTypes.Retail);
            _this.orderRepository = new OrderRepository_1.OrderRepository();
            _this.productRepository = new ProductRepository_1.ProductRepository();
            _this.back = function () {
                if (_this.isChartVisible()) {
                    _this.isChartVisible(false);
                }
                else {
                    _this.navigator.goHome();
                }
            };
            _this.onDBError = function (transaction, sqlError) {
                alert("Data Analyse Page: " + sqlError.message);
            };
            _this.setChartDataType = function (dataType) {
                switch (dataType) {
                    case "Quantity":
                        if (_this.chartDataType() !== "Quantity") {
                            _this.chartDataType("Quantity");
                            _this.showQuantityChart();
                        }
                        break;
                    case "Total":
                        if (_this.chartDataType() !== "Total") {
                            _this.chartDataType("Total");
                            _this.showTotalChart();
                        }
                        break;
                    case "Profit":
                        if (_this.chartDataType() !== "Profit") {
                            _this.chartDataType("Profit");
                            _this.showProfitChart();
                        }
                        break;
                }
            };
            _this.title = ko.observable("Data Analyse");
            _this.pageId = Consts.Pages.DataAnalyse.Id;
            _this.selectedQuantitySaleType.subscribe(function (newValue) {
                _this.showQuantityChart();
            });
            return _this;
        }
        DataAnalyse.prototype.showTodayChart = function () {
            this.chartTimespanOption = ChartTimespanOptions.Today;
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showWeekChart = function () {
            this.chartTimespanOption = ChartTimespanOptions.Week;
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showMonthChart = function () {
            this.chartTimespanOption = ChartTimespanOptions.Month;
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showCustomChart = function () {
            //this.chartTimespanOption = ChartTimespanOptions.Today;
            //this.showQuantityChart();
        };
        DataAnalyse.prototype.showTotalChart = function () {
            alert("total chart");
        };
        DataAnalyse.prototype.showProfitChart = function () {
            alert("profict chart");
        };
        DataAnalyse.prototype.showQuantityChart = function () {
            var _this = this;
            this.chartDataType("Quantity");
            this.isChartVisible(true);
            var timeSpanString = '';
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
            var labels = [];
            var data = [];
            if (this.selectedQuantitySaleType() != -1) {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, this.selectedQuantitySaleType(), function (transaction, orderSet) {
                    if (orderSet.rows.length > 0) {
                        var rows_1 = orderSet.rows;
                        var _loop_1 = function (i) {
                            var order = rows_1[i];
                            _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
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
                                if (rows_1.length - 1 == i) {
                                    initializeChart();
                                }
                            }, _this.onDBError);
                        };
                        for (var i = 0; i < rows_1.length; i++) {
                            _loop_1(i);
                        }
                    }
                }, this.onDBError);
            }
            else {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, Order_1.OrderTypes.Retail, function (transaction, orderSet) {
                    if (orderSet.rows.length > 0) {
                        var rows_2 = orderSet.rows;
                        var _loop_2 = function (i) {
                            var order = rows_2[i];
                            _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
                                if (productSet.rows.length > 0) {
                                    labels.push(productSet.rows[0].Name);
                                }
                                else {
                                    labels.push("unknown" + i);
                                }
                                //retail
                                data.push(order.Quantity);
                                if (rows_2.length - 1 == i) {
                                    _this.orderRepository.getOrdersForDataAnalyse(timeSpanString, Order_1.OrderTypes.Wholesale, function (transaction, orderSet) {
                                        if (orderSet.rows.length > 0) {
                                            var rows_3 = orderSet.rows;
                                            var _loop_3 = function (i_1) {
                                                var order_1 = rows_3[i_1];
                                                _this.productRepository.getProductById(order_1.ProductId, function (transaction, productSet) {
                                                    var productExisted = false;
                                                    var index = -1;
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
                                                        labels.push("unknown" + i_1);
                                                    }
                                                    //wholesale
                                                    if (productExisted === true) {
                                                        data[index] = data[index] + (order_1.Quantity * productSet.rows[0].Times);
                                                    }
                                                    else {
                                                        data.push(order_1.Quantity * productSet.rows[0].Times);
                                                    }
                                                    if (rows_3.length - 1 == i_1) {
                                                        initializeChart();
                                                    }
                                                }, _this.onDBError);
                                            };
                                            for (var i_1 = 0; i_1 < rows_3.length; i_1++) {
                                                _loop_3(i_1);
                                            }
                                        }
                                    }, _this.onDBError);
                                }
                            }, _this.onDBError);
                        };
                        for (var i = 0; i < rows_2.length; i++) {
                            _loop_2(i);
                        }
                    }
                }, this.onDBError);
            }
            var initializeChart = function () {
                var ctx = (document.getElementById("dataChart")).getContext("2d");
                //Why have to make the todayChart as a class scoped variable
                //https://github.com/chartjs/Chart.js/issues/350
                if (_this.todayChart)
                    _this.todayChart.destroy();
                _this.todayChart = new Chart(ctx, {
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
            };
        };
        return DataAnalyse;
    }(PageBase_1.PageBase));
    exports.DataAnalyse = DataAnalyse;
    var ChartTimespanOptions;
    (function (ChartTimespanOptions) {
        ChartTimespanOptions[ChartTimespanOptions["Today"] = 1] = "Today";
        ChartTimespanOptions[ChartTimespanOptions["Week"] = 2] = "Week";
        ChartTimespanOptions[ChartTimespanOptions["Month"] = 3] = "Month";
        ChartTimespanOptions[ChartTimespanOptions["CustomTime"] = 4] = "CustomTime";
    })(ChartTimespanOptions || (ChartTimespanOptions = {}));
});
//# sourceMappingURL=DataAnalyse.js.map