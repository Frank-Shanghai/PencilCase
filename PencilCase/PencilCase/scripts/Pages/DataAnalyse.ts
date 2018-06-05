import { PageBase } from './PageBase';
import { Navigator } from '../Navigator';
import * as Consts from './Consts';
declare var palette: any;

export class DataAnalyse extends PageBase {
    private navigator: Navigator = Navigator.instance;
    private isChartVisible: KnockoutObservable<boolean> = ko.observable(false);

    constructor() {
        super();
        this.title = ko.observable("Data Analyse");
        this.pageId = Consts.Pages.DataAnalyse.Id;
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
        var ctx = (<any>(document.getElementById("myChart"))).getContext("2d");
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
    }

    public showWeekChart() { }
    public showMonthChart() { }
    public showCustomChart() { }
}