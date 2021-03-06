﻿// For an introduction to the Blank template, see the following documentation:
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
        this.enableFilterableSelect();

        Navigator.instance.initialize();

        // TODO: Cordova has been loaded. Perform any initialization that requires Cordova here.
        //var parentElement = document.getElementById('deviceready');
        //var listeningElement = parentElement.querySelector('.listening');
        //var receivedElement = parentElement.querySelector('.received');
        //listeningElement.setAttribute('style', 'display:none;');
        //receivedElement.setAttribute('style', 'display:block;');

        this.initializeDatabase();
    }


    private enableFilterableSelect = () => {
        let pageIsSelectmenuDialog = (page: any) => {
            var isDialog = false,
                id = page && page.attr("id");
            $(".filterable-select").each(function () {
                if ($(this).attr("id") + "-dialog" === id) {
                    isDialog = true;
                    return false;
                }
            });
            return isDialog;
        }

        (<any>$).mobile.document
            // Upon creation of the select menu, we want to make use of the fact that the ID of the
            // listview it generates starts with the ID of the select menu itself, plus the suffix "-menu".
            // We retrieve the listview and insert a search input before it.
            .on("selectmenucreate", ".filterable-select", function (event) {
                var input,
                    selectmenu = $(event.target),
                    list = $("#" + selectmenu.attr("id") + "-menu"),
                    form = list.jqmData("filter-form");
                // We store the generated form in a variable attached to the popup so we avoid creating a
                // second form/input field when the listview is destroyed/rebuilt during a refresh.
                if (!form) {
                    input = $("<input data-type='search'></input>");
                    form = $("<form></form>").append(input);
                    input.textinput();
                    list
                        .before(form)
                        .jqmData("filter-form", form);
                    form.jqmData("listview", list);
                }
                // Instantiate a filterable widget on the newly created selectmenu widget and indicate that
                // the generated input form element is to be used for the filtering.
                selectmenu
                    .filterable({
                        input: input,
                        children: "> option[value]"
                    })
                    // Rebuild the custom select menu's list items to reflect the results of the filtering
                    // done on the select menu.
                    .on("filterablefilter", function () {
                        selectmenu.selectmenu("refresh");
                    });
            })
            // The custom select list may show up as either a popup or a dialog, depending on how much
            // vertical room there is on the screen. If it shows up as a dialog, then the form containing
            // the filter input field must be transferred to the dialog so that the user can continue to
            // use it for filtering list items.
            .on("pagecontainerbeforeshow", function (event, data) {
                var listview, form;
                // We only handle the appearance of a dialog generated by a filterable selectmenu
                if (!pageIsSelectmenuDialog(data.toPage)) {
                    return;
                }
                listview = data.toPage.find("ul");
                form = listview.jqmData("filter-form");
                // Attach a reference to the listview as a data item to the dialog, because during the
                // pagecontainerhide handler below the selectmenu widget will already have returned the
                // listview to the popup, so we won't be able to find it inside the dialog with a selector.
                data.toPage.jqmData("listview", listview);
                // Place the form before the listview in the dialog.
                listview.before(form);
            })
            // After the dialog is closed, the form containing the filter input is returned to the popup.
            .on("pagecontainerhide", function (event, data) {
                var listview, form;
                // We only handle the disappearance of a dialog generated by a filterable selectmenu
                if (!pageIsSelectmenuDialog(data.toPage)) {
                    return;
                }
                listview = data.prevPage.jqmData("listview"),
                    form = listview.jqmData("filter-form");
                // Put the form back in the popup. It goes ahead of the listview.
                listview.before(form);
            });
    }

    // Just for testing, remove all function calls to it and this function
    private initializeDatabase = () => {
        let db = this.openDataBase();
        if (db) {
            db.transaction((transaction) => {
                // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                //transaction.executeSql('drop table if exists UnitOfMeasure', [], null, this.onDBError);
                transaction.executeSql('create table if not exists UnitOfMeasure (Id text primary key, Name text not null, Description text)', [], null, this.onDBError);

                // Uncomment the line below if need to re-create the table, like adding/removing/changing columns
                // RetailPrice -- 零售价
                // RetailWholesalePrice -- 零批价
                // WholesalePrice -- 批发价
                // ImportWholesalePrice -- 添加产品中可修改，最新进货价（按批发单位）
                // ImportRetailPrice -- 计算得出，最新进货价（按零售单位），其实可以根据上面得出，只是存在了数据库中，懒得改了
                // WholesaleCost -- 计算得出，最新批发成本价
                // RetailCost -- 计算得出，最新零售成本价，根据WholesaleCost和Times计算得出，存在数据库中方便读取使用，不用每次都计算一次，更新WholesaleCost的时候更新RetailCost
                // Image -- 默认blob类型

                //transaction.executeSql('DROP TABLE IF EXISTS Product', [], null, this.onDBError);
                transaction.executeSql('CREATE TABLE IF NOT EXISTS Product (\
                                        Id text primary key,\
                                        Name text not null, \
                                        Description text,\
                                        RetailPrice real not null,\
                                        RetailWholesalePrice real not null,\
                                        RetailUnit text,\
                                        WholesalePrice real not null,\
                                        WholesaleUnit text,\
                                        ImportWholesalePrice real not  null,\
                                        ImportRetailPrice real not null,\
                                        WholesaleCost real not  null,\
                                        RetailCost real not null,\
                                        Times integer not null,\
                                        Inventory integer not null,\
                                        Image,\
                                        CreatedDate datetime,\
                                        ModifiedDate datetime,\
                                        foreign key(RetailUnit) references UnitOfMeasure(Id),\
                                        foreign key(WholesaleUnit) references UnitOfMeasure(Id)\
                                        )', [], null, this.onDBError);

                // I have to name the table as Orders instead of Order, because Order is a reserved word by SQL Lite, it did took me some time
                // https://www.sqlite.org/lang_keywords.html
                //transaction.executeSql('DROP TABLE IF EXISTS Orders', [], null, this.onDBError);
                transaction.executeSql('CREATE TABLE IF NOT EXISTS Orders (\
                                        Id text primary key not null,\
                                        BatchId text not null,\
                                        ProductId text not null, \
                                        Type int,\
                                        Unit text not null,\
                                        Price real not null,\
                                        Quantity real,\
                                        Total real not null,\
                                        CreatedDate datetime, \
                                        ModifiedDate datetime,\
                                        foreign key(Unit) references UnitOfMeasure(Id),\
                                        foreign key(ProductId) references Product(Id)\
                                        )', [], null, this.onDBError);

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
                        let sqlStatement = "insert into Product values ('" + Utils.guid() + "', 'Product1', 'Product description ....', 1.5, 1.2,'" + guidGe + "', 28, '" + guidXiang + "', 0, 0, 0, 0, 24, 0, null, '4/25/2018', '4/25/2018')";
                        let sqlStatement1 = "insert into Product values ('" + Utils.guid() + "', '可爱多', 'Product description ....', 6, 5,'" + guidGe + "', 68, '" + guidXiang + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                        let sqlStatement2 = "insert into Product values ('" + Utils.guid() + "', '东北大板', 'Product description ....', 6, 5,'" + guidKuai + "', 68, '" + guidJian + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                        let sqlStatement3 = "insert into Product values ('" + Utils.guid() + "', '随变', 'Product description ....', 6, 5,'" + guidGe + "', 68, '" + guidXiang + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";
                        let sqlStatement4 = "insert into Product values ('" + Utils.guid() + "', '光明', 'Product description ....', 6, 5,'" + guidKuai + "', 68, '" + guidJian + "', 0, 0, 0, 0, 12, 0, null, '4/25/2018', '4/25/2018')";

                        transaction.executeSql(clearStatement, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement1, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement2, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement3, [], null, this.onDBError);
                        transaction.executeSql(sqlStatement4, [], null, this.onDBError);


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



