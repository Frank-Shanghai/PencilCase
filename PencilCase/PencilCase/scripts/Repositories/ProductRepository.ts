import { Application } from '../application';
import { Product } from '../Models/Product';

export class ProductRepository {
    private db: Database;

    constructor() {
        this.db = Application.instance.openDataBase();
    }

    public update = (product: Product, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = "update Product set Name = '" + product.Name + "', Description = '" + product.Description + "', RetailPrice = " + product.RetailPrice + ", RetailUnit = '" + product.RetailUnit + "', WholesalePrice = " +
            product.WholesalePrice + ", WholesaleUnit = '" + product.WholesaleUnit + "', ImportWholesalePrice = " + product.ImportWholesalePrice + ", ImportRetailPrice = " + product.ImportRetailPrice + ", Times = " + product.Times + ", Inventory = " + product.Inventory + ", Image = '" + product.Image + "', ModifiedDate = '" +
            moment(product.ModifiedDate.toISOString()).format("YYYY-MM-DD") + "' where Id = '" + product.Id + "'";

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public insert = (product: Product, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        let sqlString = "insert into Product values ('" + product.Id + "','" + product.Name + "','" + product.Description + "'," + product.RetailPrice + ",'" + product.RetailUnit + "'," +
            product.WholesalePrice + ",'" + product.WholesaleUnit + "'," + product.ImportWholesalePrice + "," + product.ImportRetailPrice + "," + product.Times + "," + product.Inventory + ",'" + product.Image + "','" +
            moment(product.CreatedDate.toISOString()).format("YYYY-MM-DD") + "','" + moment(product.ModifiedDate.toISOString()).format("YYYY-MM-DD") + "')";

        this.db.transaction((transaction) => {
            transaction.executeSql(sqlString, [], successCallback, errorCallback);
        });
    }

    public getProductById = (id: string, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        this.db.transaction((transaction) => {
            transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.Id = '" + id + "'",
                [], successCallback, errorCallback);
        });
    }

    public getProductByRowId = (rowId: number, successCallback?: (transaction: SqlTransaction, resultSet: SqlResultSet) => void, errorCallback?: (transaction: SqlTransaction, sqlError: SqlError) => void) => {
        this.db.transaction((transaction) => {
            transaction.executeSql("select P.*, UOM1.Name RetailUnitName, UOM2.Name WholesaleUnitName from Product P \
                                                join UnitOfMeasure UOM1 on P.RetailUnit = UOM1.Id\
                                                join UnitOfMeasure UOM2 on P.WholesaleUnit = UOM2.Id\
                                                where P.rowid = " + rowId,
                [], successCallback, errorCallback);
        });
    }

}