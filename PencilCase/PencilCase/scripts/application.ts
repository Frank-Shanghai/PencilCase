// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
"use strict";

import * as Utils from './Utils';
import { PageBase } from './Pages/PageBase';
import { HomePage } from './Pages/HomePage';
import { ProductManagement } from './Pages/ProductManagement';
import { Navigator } from './Navigator';

export class Application {
    public activePage: KnockoutObservable<PageBase> = ko.observable(null);
    public pages: Array<PageBase> = [];
    public homePage: KnockoutObservable<HomePage>;
    public confirmDialog: KnockoutObservable<any> = ko.observable(null);
    private db: Database;
    private isDataLoaded: KnockoutObservable<boolean> = ko.observable(false);

    private static _instance: Application;

    public static get instance(): Application {
        if (Application._instance == null) {
            Application._instance = new Application();
        }

        return Application._instance;
    }

    constructor() {
        this.openHomePage();
    }

    private openHomePage() {
        let homePage = new HomePage();
        this.activePage(homePage);
        this.homePage = ko.observable(homePage);
    }

    public openDataBase = (): Database => {
        if (this.db) {
            return this.db;
        }
        else {
            this.db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
            if (this.db) return this.db;
            return null;
        }
    }

    public initialize(): void {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }

    private onDeviceReady = (): void => {
        let firstPageUrl = window.location.href;
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);
        document.addEventListener('backbutton', function (evt) {
            if (cordova.platformId !== 'android') {
                return;
            }

            if (!Application.instance.confirmDialog()) {
                if (Application.instance.activePage().back)
                    Application.instance.activePage().back();
            }
            else {
                Application.instance.confirmDialog(null);
                window.history.back();
            }
        }, false);

        ko.applyBindings(Application.instance, document.documentElement);

        Navigator.instance.initialize();

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        //var parentElement = document.getElementById('deviceready');
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        this.initializeDatabase();
    }

    // Just for testing, remove all function calls to it and this function
    private initializeDatabase = () => {
        let db = this.openDataBase();
        if (db) {
            db.transaction((transaction) => {
                // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                //transaction.executeSql('DROP TABLE IF EXISTS Product', [], null, onDBError);
                transaction.executeSql('CREATE TABLE IF NOT EXISTS Product (\
                                        Id text primary key,\
                                        Name text not null, \
                                        Description text,\
                                        RetailPrice real not null,\
                                        RetailUnit text,\
                                        WholesalePrice real not null,\
                                        WholesaleUnit text,\
                                        ImportWholesalePrice real not  null,\
                                        ImportRetailPrice real not null,\
                                        Times integer not null,\
                                        Inventory integer not null,\
                                        Image,\
                                        CreatedDate datetime,\
                                        ModifiedDate datetime,\
                                        foreign key(RetailUnit) references UnitOfMeasure(Id),\
                                        foreign key(WholesaleUnit) references UnnitOfMeasure(Id)\
                                        )', [], null, this.onDBError);

                // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                //transaction.executeSql('drop table if exists UnitOfMeasure', [], null, onDBError);
                transaction.executeSql('create table if not exists UnitOfMeasure (Id text primary key, Name text not null, Description text)', [], null, this.onDBError);

                //transaction.executeSql('CREATE TABLE IF NOT EXISTS Product (\
                //                        Id text primary key,\
                //                        Name text not null, \
                //                        Description text,\
                //                        RetailPrice real not null,\
                //                        RetailUnit text,\
                //                        WholesalePrice real not null,\
                //                        WholesaleUnit text,\
                //                        ImportWholesalePrice real not  null,\
                //                        ImportRetailPrice real not null,\
                //                        Times integer not null,\
                //                        Inventory integer not null,\
                //                        Image,\
                //                        CreatedDate datetime,\
                //                        ModifiedDate datetime,\
                //                        foreign key(RetailUnit) references UnitOfMeasure(Id),\
                //                        foreign key(WholesaleUnit) references UnnitOfMeasure(Id)\
                //                        )', [], null, this.onDBError);

            }, null, this.createTestData);
        }
        else {
            alert("Failed to open database.")
        }
    }

    private createTestData = () => {
        let db = this.openDataBase();
        if (db) {
            db.transaction((transaction) => {
                transaction.executeSql('select Id from UnitOfMeasure', [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                    if (resultSet.rows.length === 0) {
                        let guidGe = Utils.guid();
                        let guidXiang = Utils.guid();
                        let guidKuai = Utils.guid();
                        let guidJian = Utils.guid();

                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidGe + "', '个')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '筒')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidXiang + "', '箱')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidJian + "', '件')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + guidKuai + "', '块')", [], null, this.onDBError);

                        let clearStatement = "delete from Product";
                        // 箱， 个
                        let sqlStatement = "insert into Product values ('" + Utils.guid() + "', 'Product1', 'Product description ....', 1.5, '" + guidGe + "', 28, '" + guidXiang + "', 24, 1, 24, 9999, null, '4/25/2018', '4/25/2018')";
                        let sqlStatement1 = "insert into Product values ('" + Utils.guid() + "', '可爱多', 'Product description ....', 6, '" + guidGe + "', 68, '" + guidXiang + "', 60, 5, 12, 9999, null, '4/25/2018', '4/25/2018')";
                        let sqlStatement2 = "insert into Product values ('" + Utils.guid() + "', '东北大板', 'Product description ....', 6, '" + guidKuai + "', 68, '" + guidJian + "', 60, 5, 12, 9999, null, '4/25/2018', '4/25/2018')";

                        transaction.executeSql(clearStatement, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement1, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement2, [], null, this.onDBError);

                    }
                }, this.onDBError);
            },
                () => {
                    alert("Failed to initialize data.")
                },
                () => {
                    this.isDataLoaded(true);
                });
        }
        else {
            alert("Failed to open database.")
        }
    }

    private onDBError = (transaction: SqlTransaction, sqlError: SqlError, customMessage?: string) => {
        let errorMessage = sqlError.message;
        if (customMessage) {
            errorMessage = "User Message: " + customMessage + "\r\n" + errorMessage;
        }

        alert(errorMessage);
    }

    public onApplicationError = (): void => {
        alert("Application Error happened.");
    }

    private onPause = (): void => {
        // TODO: This application has been suspended. Save application state here.
    }

    private onResume = (): void => {
        // TODO: This application has been reactivated. Restore application state here.
    }

}



