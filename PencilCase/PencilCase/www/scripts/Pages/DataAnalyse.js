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
define(["require", "exports", "./PageBase", "../Navigator", "./Consts"], function (require, exports, PageBase_1, Navigator_1, Consts) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    var DataAnalyse = (function (_super) {
        __extends(DataAnalyse, _super);
        function DataAnalyse() {
            var _this = _super.call(this) || this;
            _this.navigator = Navigator_1.Navigator.instance;
            _this.isChartVisible = ko.observable(false);
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
            _this.title = ko.observable("Data Analyse");
            _this.pageId = Consts.Pages.DataAnalyse.Id;
            return _this;
        }
        DataAnalyse.prototype.showTodayChart = function () {
            this.isChartVisible(true);
            var ctx = (document.getElementById("myChart")).getContext("2d");
            var myChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    datasets: [{
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            backgroundColor: palette('tol', 6).map(function (hex) {
                                return '#' + hex;
                            })
                        }]
                }
            });
        };
        DataAnalyse.prototype.showWeekChart = function () { };
        DataAnalyse.prototype.showMonthChart = function () { };
        DataAnalyse.prototype.showCustomChart = function () { };
        return DataAnalyse;
    }(PageBase_1.PageBase));
    exports.DataAnalyse = DataAnalyse;
});
//# sourceMappingURL=DataAnalyse.js.map