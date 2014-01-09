(function (global) {
    var DPW1ViewModel,
        app = global.app = global.app || {};

    DPW1ViewModel = kendo.data.ObservableObject.extend({
        dpw1DataSource: null,

        init: function () {
            var that = this,
                dataSource;

            //var DpwServicesURL = "data/dpw1.xml";
            //var DpwServicesURL = "http://apps.intranet/adm/tools/rssFeed/feed2.aspx?xsltid=10&i=347&parent_service_id=2008";
            //var DpwServicesURL = "http://dpw.lacounty.gov/adm/tools/rssFeed/feed2.aspx?xsltid=10&i=98&parent_service_id=1715";
            var DpwServicesURL = "http://dpw.lacounty.gov/adm/tools/rssFeed/feed2.aspx?xsltid=10&i=277";
            
            kendo.data.ObservableObject.fn.init.apply(that, []);

            
            dataSource = new kendo.data.DataSource({
                transport: {
                    // specify the XML file to read. The same as read: { url: "books.xml" }
                    read: {
                        url: DpwServicesURL,
                        dataType: "xml"
                    }
                },
                schema: {
                    // specify the the schema is XML
                    type: "xml",
                    // the XML element which represents a single data record
                    data: "/rss/channel/item",
                    // define the model - the object which will represent a single data record
                    model: {
                        // configure the fields of the object
                        fields: {
                            service_id: "service_id/text()",
                            service_name: "service_name/text()"
                        }
                    }
                }
            });

            that.set("dpw1DataSource", dataSource);
        }
    });

    app.dpw1Service = {
        viewModel: new DPW1ViewModel()
    };
})(window);