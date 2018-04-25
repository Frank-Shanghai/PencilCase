// For an introduction to the Blank template, see the following documentation:
// http://go.microsoft.com/fwlink/?LinkID=397705
// To debug code on page load in cordova-simulate or on Android devices/emulators: launch your app, set breakpoints, 
// and then run "window.location.reload()" in the JavaScript Console.
"use strict";

import * as Utils from './Utils';
import { PageBase } from './Pages/PageBase';
import { HomePage } from './Pages/HomePage';

export class Application {
    public activePage: KnockoutObservable<PageBase> = ko.observable(null);
    public pages: Array<PageBase> = [];

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
        this.pages.push(homePage);
        this.activePage(homePage);
    }

    public initialize(): void {
        ko.applyBindings(Application.instance, document.documentElement);
        document.addEventListener('deviceready', this.onDeviceReady, false);
    }

    private onDeviceReady(): void {
        document.addEventListener('pause', this.onPause, false);
        document.addEventListener('resume', this.onResume, false);

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        //var parentElement = document.getElementById('deviceready');
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        this.initializeDatabase();
    }

    // Just for testing, remove all function calls to it and this function
    private initializeDatabase() {
        let db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
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
            }, null, this.createTestData);
        }
        else {
            alert("Failed to open database.")
        }
    }

    private createTestData() {
        let db = window.openDatabase("PencilCase", "0.1", "Pencil Case", 2 * 1024 * 1024);
        if (db) {
            db.transaction((transaction) => {
                transaction.executeSql('select Id from UnitOfMeasure', [], (transaction: SqlTransaction, resultSet: SqlResultSet) => {
                    if (resultSet.rows.length === 0) {
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '个')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '筒')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '箱')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '件')", [], null, this.onDBError);
                        transaction.executeSql("insert into UnitOfMeasure (Id, Name) values ('" + Utils.guid() + "', '块')", [], null, this.onDBError);
                    }
                }, this.onDBError);
            });
        }
        else {
            alert("Failed to open database.")
        }
    }

    private onDBError(transaction: SqlTransaction, sqlError: SqlError) {
        alert(sqlError.message);
    }

    public onApplicationError(): void {
        alert("Application Error happened.");
    }

    private onPause(): void {
        // TODO: This application has been suspended. Save application state here.
    }

    private onResume(): void {
        // TODO: This application has been reactivated. Restore application state here.
    }

}



