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
                { text: "RetailWholesale", value: Order_1.OrderTypes.RetailWholesale },
                { text: "Wholesale", value: Order_1.OrderTypes.Wholesale },
                { text: "All", value: -1 },
            ];
            _this.selectedQuantitySaleType = ko.observable(Order_1.OrderTypes.Retail);
            _this.orderRepository = new OrderRepository_1.OrderRepository();
            _this.productRepository = new ProductRepository_1.ProductRepository();
            _this.chartPageTitle = ko.observable('');
            _this.customStartDate = '';
            _this.customEndDate = '';
            _this.isDatePickersInitialized = false;
            _this.isEmptyData = ko.observable(false);
            _this.chartSummary = ko.observable('');
            _this.back = function () {
                if (_this.isChartVisible()) {
                    _this.isChartVisible(false);
                    _this.customStartDate = '';
                    _this.customEndDate = '';
                    // To hide custom datetime picker
                    _this.chartPageTitle(null);
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
                            _this.showQuantityChart();
                        }
                        break;
                    case "Total":
                        if (_this.chartDataType() !== "Total") {
                            _this.showTotalChart();
                        }
                        break;
                    case "Profit":
                        if (_this.chartDataType() !== "Profit") {
                            _this.showProfitChart();
                        }
                        break;
                }
            };
            _this.initializeChart = function (labels, data) {
                var ctx = (document.getElementById("dataChart")).getContext("2d");
                //Why have to make the todayChart as a class scoped variable
                //https://github.com/chartjs/Chart.js/issues/350
                if (_this.chartComponent)
                    _this.chartComponent.destroy();
                _this.chartComponent = new Chart(ctx, {
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
            _this.title = ko.observable("Data Analyse");
            _this.pageId = Consts.Pages.DataAnalyse.Id;
            _this.selectedQuantitySaleType.subscribe(function (newValue) {
                _this.refreshChart();
            });
            return _this;
        }
        DataAnalyse.prototype.refreshChart = function () {
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
        };
        DataAnalyse.prototype.showTodayChart = function () {
            this.chartTimespanOption = ChartTimespanOptions.Today;
            this.chartPageTitle("Today");
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showWeekChart = function () {
            this.chartTimespanOption = ChartTimespanOptions.Week;
            this.chartPageTitle("Week");
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showMonthChart = function () {
            this.chartTimespanOption = ChartTimespanOptions.Month;
            this.chartPageTitle("Month");
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showCustomChart = function () {
            var _this = this;
            this.chartTimespanOption = ChartTimespanOptions.CustomTime;
            this.chartPageTitle("Custom");
            this.customStartDate = moment(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).format("YYYY-MM-DD");
            this.customEndDate = moment(new Date(Date.now())).format("YYYY-MM-DD");
            var datePickerOptions = {
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
                }), function (start, end, label) {
                    _this.customStartDate = start.format('YYYY-MM-DD');
                });
                $('input[name="endDate"]').daterangepicker($.extend(datePickerOptions, {
                    startDate: moment(new Date(this.customEndDate)).format("MM/DD/YYYY")
                }), function (start, end, label) {
                    _this.customEndDate = start.format('YYYY-MM-DD');
                });
                this.isDatePickersInitialized = true;
            }
            this.showQuantityChart();
        };
        DataAnalyse.prototype.showTotalChart = function () {
            var _this = this;
            this.chartDataType("Total");
            this.isChartVisible(true);
            var timeSpanString = this.getTimespanStringByOption(this.chartTimespanOption);
            var labels = [];
            var data = [];
            var chartTotal = 0;
            this.orderRepository.getOrdersForDataAnalyse(timeSpanString, this.selectedQuantitySaleType() != -1, this.selectedQuantitySaleType(), function (transaction, orderSet) {
                if (orderSet.rows.length > 0) {
                    _this.isEmptyData(false);
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
                            data.push(order.Total);
                            chartTotal += order.Total;
                            if (rows_1.length - 1 == i) {
                                _this.chartSummary("总计：" + chartTotal + "元");
                                _this.initializeChart(labels, data);
                            }
                        }, _this.onDBError);
                    };
                    for (var i = 0; i < rows_1.length; i++) {
                        _loop_1(i);
                    }
                }
                else {
                    _this.isEmptyData(true);
                }
            }, this.onDBError);
        };
        DataAnalyse.prototype.showProfitChart = function () {
            var _this = this;
            this.chartDataType("Profit");
            this.isChartVisible(true);
            var timeSpanString = this.getTimespanStringByOption(this.chartTimespanOption);
            var labels = [];
            var data = [];
            var total = 0;
            if (this.selectedQuantitySaleType() != -1) {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, this.selectedQuantitySaleType(), function (transaction, orderSet) {
                    if (orderSet.rows.length > 0) {
                        _this.isEmptyData(false);
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
                                //wholesale
                                if (order.Type == 2) {
                                    var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].WholesaleCost)).toFixed(2));
                                    data.push(value);
                                    total += value;
                                }
                                else {
                                    var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                    data.push(value);
                                    total += value;
                                }
                                if (rows_2.length - 1 == i) {
                                    _this.chartSummary("总计：" + total + "元");
                                    _this.initializeChart(labels, data);
                                }
                            }, _this.onDBError);
                        };
                        for (var i = 0; i < rows_2.length; i++) {
                            _loop_2(i);
                        }
                    }
                    else {
                        _this.isEmptyData(true);
                    }
                }, this.onDBError);
            }
            else {
                var handleWholesale_1 = function () {
                    _this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, Order_1.OrderTypes.Wholesale, function (transaction, orderSet) {
                        if (orderSet.rows.length > 0) {
                            var rows_3 = orderSet.rows;
                            var _loop_3 = function (i) {
                                var order = rows_3[i];
                                _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
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
                                        labels.push("unknown" + i);
                                    }
                                    //wholesale
                                    if (productExisted === true) {
                                        var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].WholesaleCost)).toFixed(2));
                                        data[index] = data[index] + value;
                                        total += value;
                                    }
                                    else {
                                        var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].WholesaleCost)).toFixed(2));
                                        data.push(value);
                                        total += value;
                                    }
                                    if (rows_3.length - 1 == i) {
                                        _this.isEmptyData(false);
                                        _this.initializeChart(labels, data);
                                        _this.chartSummary("总计：" + total + "元");
                                    }
                                }, _this.onDBError);
                            };
                            for (var i = 0; i < rows_3.length; i++) {
                                _loop_3(i);
                            }
                        }
                        else {
                            if (total > 0) {
                                _this.isEmptyData(false);
                                _this.initializeChart(labels, data);
                                _this.chartSummary("总计：" + total + "元");
                            }
                            else {
                                _this.isEmptyData(true);
                            }
                        }
                    }, _this.onDBError);
                };
                var handleRetailWholesaleAndWholesale_1 = function () {
                    _this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, Order_1.OrderTypes.RetailWholesale, function (transaction, orderSet) {
                        if (orderSet.rows.length > 0) {
                            var rows_4 = orderSet.rows;
                            var _loop_4 = function (i) {
                                var order = rows_4[i];
                                _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
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
                                        labels.push("unknown" + i);
                                    }
                                    //retailWholesale
                                    if (productExisted === true) {
                                        // When calculating profict, use retail cost
                                        var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                        data[index] = data[index] + value;
                                        total += value;
                                    }
                                    else {
                                        var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                        data.push(value);
                                        total += value;
                                    }
                                    if (rows_4.length - 1 == i) {
                                        handleWholesale_1();
                                    }
                                }, _this.onDBError);
                            };
                            for (var i = 0; i < rows_4.length; i++) {
                                _loop_4(i);
                            }
                        }
                        else {
                            handleWholesale_1();
                        }
                    }, _this.onDBError);
                };
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, Order_1.OrderTypes.Retail, function (transaction, orderSet) {
                    if (orderSet.rows.length > 0) {
                        var rows_5 = orderSet.rows;
                        var _loop_5 = function (i) {
                            var order = rows_5[i];
                            _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
                                if (productSet.rows.length > 0) {
                                    labels.push(productSet.rows[0].Name);
                                }
                                else {
                                    labels.push("unknown" + i);
                                }
                                //retail
                                var value = Number((Number(order.Total) - Number(order.Quantity) * Number(productSet.rows[0].RetailCost)).toFixed(2));
                                data.push(value);
                                if (rows_5.length - 1 == i) {
                                    handleRetailWholesaleAndWholesale_1();
                                }
                            }, _this.onDBError);
                        };
                        for (var i = 0; i < rows_5.length; i++) {
                            _loop_5(i);
                        }
                    }
                    else {
                        handleRetailWholesaleAndWholesale_1();
                    }
                }, this.onDBError);
            }
        };
        DataAnalyse.prototype.showQuantityChart = function () {
            var _this = this;
            this.chartDataType("Quantity");
            this.isChartVisible(true);
            var timeSpanString = this.getTimespanStringByOption(this.chartTimespanOption);
            var labels = [];
            var data = [];
            var total = 0;
            if (this.selectedQuantitySaleType() != -1) {
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, this.selectedQuantitySaleType(), function (transaction, orderSet) {
                    if (orderSet.rows.length > 0) {
                        _this.isEmptyData(false);
                        var rows_6 = orderSet.rows;
                        var _loop_6 = function (i) {
                            var order = rows_6[i];
                            _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
                                if (productSet.rows.length > 0) {
                                    labels.push(productSet.rows[0].Name);
                                }
                                else {
                                    labels.push("unknown" + i);
                                }
                                //wholesale
                                if (order.Type == 2) {
                                    var value = order.Quantity * productSet.rows[0].Times;
                                    data.push(value);
                                    total += value;
                                }
                                else {
                                    data.push(order.Quantity);
                                    total += order.Quantity;
                                }
                                if (rows_6.length - 1 == i) {
                                    _this.chartSummary("总计：" + total);
                                    _this.initializeChart(labels, data);
                                }
                            }, _this.onDBError);
                        };
                        for (var i = 0; i < rows_6.length; i++) {
                            _loop_6(i);
                        }
                    }
                    else {
                        _this.isEmptyData(true);
                    }
                }, this.onDBError);
            }
            else {
                // Finally, handle wholesale
                var handleWholesale_2 = function () {
                    _this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, Order_1.OrderTypes.Wholesale, function (transaction, orderSet) {
                        if (orderSet.rows.length > 0) {
                            var rows_7 = orderSet.rows;
                            var _loop_7 = function (i) {
                                var order = rows_7[i];
                                _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
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
                                    if (rows_7.length - 1 == i) {
                                        _this.isEmptyData(false);
                                        _this.chartSummary("总计：" + total);
                                        _this.initializeChart(labels, data);
                                    }
                                }, _this.onDBError);
                            };
                            for (var i = 0; i < rows_7.length; i++) {
                                _loop_7(i);
                            }
                        }
                        else {
                            if (total > 0) {
                                _this.isEmptyData(false);
                                _this.chartSummary("总计：" + total);
                                _this.initializeChart(labels, data);
                            }
                            else {
                                _this.isEmptyData(true);
                            }
                        }
                    }, _this.onDBError);
                };
                // Second, handle retailWholesale
                var handleRetailWholesaleAndWholesale_2 = function () {
                    _this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, Order_1.OrderTypes.RetailWholesale, function (transaction, orderSet) {
                        if (orderSet.rows.length > 0) {
                            var rows_8 = orderSet.rows;
                            var _loop_8 = function (i) {
                                var order = rows_8[i];
                                _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
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
                                    if (rows_8.length - 1 == i) {
                                        handleWholesale_2();
                                    }
                                }, _this.onDBError);
                            };
                            for (var i = 0; i < rows_8.length; i++) {
                                _loop_8(i);
                            }
                        }
                        else {
                            handleWholesale_2();
                        }
                    }, _this.onDBError);
                };
                // First, handle retail
                this.orderRepository.getOrdersForDataAnalyse(timeSpanString, true, Order_1.OrderTypes.Retail, function (transaction, orderSet) {
                    if (orderSet.rows.length > 0) {
                        var rows_9 = orderSet.rows;
                        var _loop_9 = function (i) {
                            var order = rows_9[i];
                            _this.productRepository.getProductById(order.ProductId, function (transaction, productSet) {
                                if (productSet.rows.length > 0) {
                                    labels.push(productSet.rows[0].Name);
                                }
                                else {
                                    labels.push("unknown" + i);
                                }
                                //retail
                                data.push(order.Quantity);
                                total += order.Quantity;
                                if (rows_9.length - 1 == i) {
                                    handleRetailWholesaleAndWholesale_2();
                                }
                            }, _this.onDBError);
                        };
                        for (var i = 0; i < rows_9.length; i++) {
                            _loop_9(i);
                        }
                    }
                    else {
                        handleRetailWholesaleAndWholesale_2();
                    }
                }, this.onDBError);
            }
        };
        DataAnalyse.prototype.getTimespanStringByOption = function (option) {
            var timeSpanString = '';
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