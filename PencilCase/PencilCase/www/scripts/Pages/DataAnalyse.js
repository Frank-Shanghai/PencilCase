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
            _this.onDBError = function (transaction, sqlError) {
                alert("Data Analyse Page: " + sqlError.message);
            };
            _this.title = ko.observable("Data Analyse");
            _this.pageId = Consts.Pages.DataAnalyse.Id;
            _this.back = Navigator_1.Navigator.instance.goHome;
            return _this;
        }
        DataAnalyse.prototype.showTodayChart = function () {
            var ctx = (document.getElementById("myChart")).getContext("2d");
            var myChart = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
                    datasets: [{
                            label: '# of Votes',
                            data: [12, 19, 3, 5, 2, 3],
                            backgroundColor: [
                                'rgba(255, 99, 132, 0.2)',
                                'rgba(54, 162, 235, 0.2)',
                                'rgba(255, 206, 86, 0.2)',
                                'rgba(75, 192, 192, 0.2)',
                                'rgba(153, 102, 255, 0.2)',
                                'rgba(255, 159, 64, 0.2)'
                            ],
                            borderColor: [
                                'rgba(255,99,132,1)',
                                'rgba(54, 162, 235, 1)',
                                'rgba(255, 206, 86, 1)',
                                'rgba(75, 192, 192, 1)',
                                'rgba(153, 102, 255, 1)',
                                'rgba(255, 159, 64, 1)'
                            ],
                            borderWidth: 1
                        }]
                },
            });
        };
        return DataAnalyse;
    }(PageBase_1.PageBase));
    exports.DataAnalyse = DataAnalyse;
});
//# sourceMappingURL=DataAnalyse.js.map