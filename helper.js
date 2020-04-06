//const Model = require("../db/Models");



class Helper {
    constructor() {
        // build the core of the application
    }

    async getInfoCustomerDb(tenant_id) {
        let customer = await Model.CUSTOMER_MODEL.findOne({
            tenant_id: tenant_id
        }).select({ user_email: 1, user_graph: 1, pass_graph: 1, _id: 0 });
        return customer;
    }









}

module.exports = new Helper();
