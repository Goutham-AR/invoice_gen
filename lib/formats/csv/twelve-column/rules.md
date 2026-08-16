##**Column Headers and Order Logic**
for the standard csv converter, the acceptable format is 24, 22 and 12 columns. It can be either with column header or without column header.
 
##**Credit/Return Logic**
 
A negative number written to the **quantity_shipped** col (ie **-6**) is the standard indicator for line item credits or returns.
A negative cost value written to the **unit_price** col (ie **-27.50**) is a nonstandard indicator of item credits or returns, but accepted.
 
For 24 hcolumn CSV:
in the 24 column csv file the column headers are given with there explanation in bracket. : Division_id(vendor FTS id), Invoice_number, Invoice_date, Vendor_store_id(retailer customer id), Invoice_due_date, Po_number, po_date , ref_invoice_number, quantity_shipped, Quantity_uom(Unit of Measure), Item_number, upc_pack(Pack UPC), upc_case(Case UPC) gtin_id(Global Trading Identification Number), product_description, unit_price, promotional_discount, State_tax, deposit_amount, miscellaneous_charge, extended_price, packs_per_case, County_tax City_tax .
 
Coulmns for 12 column CSV file are:
Division_id, invoice_number, invoice_date, Vendor_store_id, invoice_due_date, Po_number, po_date, quantity_shipped, Quantity_uom, item_number, product_description, unit_price
 
For 22 columns they are:
Division_id, Invoice_number, Invoice_date, Vendor_store_id, Invoice_due_date, Po_number, po_date, ref_invoice_number, quantity_shipped, Quantity_uom, Item_number, upc_pack upc_case, gtin_id, product_description, unit_price, promotional_discount, State_tax, deposit_amount, miscellaneous_charge, extended_price, packs_per_case
 
##**Charted File Schema**
 
|Col|Header/Description   |Data Type                             |Data Example                  |Mandatory or Optional?|Entity                |Silver Table.Col                        |Notes                                                 |
|---|---------------------|--------------------------------------|------------------------------|----------------------|----------------------|----------------------------------------|------------------------------------------------------|
|1  |Division_id          |Numeric                               |1000                          |Mandatory             |vendorSysId           |invoice_summary.SHIP_FROM_VENDOR_SYS_ID |No consistent match (files are uploaded)              |
|2  |invoice_number       |Alpha numeric (22 max)                |212121AN                      |Mandatory             |invoiceNumber         |invoice_summary.INVOICE_NUMBER          |                                                      |
|3  |invoice_date         |M/DD/YYYY                             |03/15/2005                    |Mandatory             |invoiceDate           |invoice_summary.INVOICE_DATE            |                                                      |
|4  |Vendor_store_id      |Alpha numeric (80 max)                |BCD111                        |Mandatory             |vendorStoreId         |invoice_summary.SHIP_TO_VENDOR_STORE_ID |                                                      |
|5  |Invoice_due_date     |M/DD/YYYY                             |03/15/2005                    |Optional              |invoiceDueDate        |invoice_summary.TERM_NET_DUE_DATE       |Pull from Col 3 if null or col omitted                |
|6  |Po_number            |Alpha numeric (22 max)                |212144AN                      |Optional              |poNumber              |invoice_summary.PO_NUMBER               |                                                      |
|7  |po_date              |M/DD/YYYY                             |03/15/2005                    |Optional              |poDate                |invoice_summary.PO_DATE                 |                                                      |
|8  |ref_invoice_number   |Alpha numeric (22 max)                |7182781AN                     |Optional              |referenceInvoiceNumber|invoice_summary.REF_INVOICE_NUMBER      |                                                      |
|9  |quantity_shipped     |Numeric – up to 2 Decimal Spaces      |25.00 or 25                   |Mandatory             |quantity              |invoice_line_items.ITEM_QUANTITY        |                                                      |
|10 |Quantity_uom         |Quantity Shipped UOM                  |BO, EA, CA, KE, DS            |Mandatory             |unitOfMeasure         |invoice_line_items.ITEM_UNIT_OF_MEASURE |                                                      |
|11 |item_number          |Alpha Numeric (20 max)                |12912901BUD                   |Mandatory             |vendorProductNumber   |invoice_line_items.VENDOR_PRODUCT_NUMBER|                                                      |
|12 |upc_pack             |Alpha Numeric (12 digit preferred)    |000001801260                  |Optional              |upcPackCode           |invoice_line_items.UPC_PACK_CODE        |                                                      |
|13 |upc_case             |Alpha Numeric (12 digit preferred)    |000001801262                  |Optional              |upcCaseCode           |invoice_line_items.UPC_CASE_CODE        |                                                      |
|14 |gtin_id              |Alpha Numeric (14 digit not required) |00000001801263                |Optional              |caseGTIN              |Not currently mapped in Databricks      |Global Trading Identification Number not mapped?      |
|15 |product_description  |Alpha Numeric (80 max)                |TRASH CAN SLIM JIM GRAY 23 GAL|Mandatory             |description           |invoice_line_items.ITEM_DESCRIPTION     |                                                      |
|16 |unit_price           |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Mandatory             |cost                  |invoice_line_items.ITEM_COST            |                                                      |
|17 |promotional_discount |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |amount                |sac_details.SAC_AMOUNT                  |chargeCode =   F810                                   |
|18 |state_tax            |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |amount                |sac_details.SAC_AMOUNT                  |Per Unit Quantity, chargeCode =   H850                |
|19 |deposit_amount       |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |amount                |sac_details.SAC_AMOUNT                  |Per Unit Quantity , chargeCode =  C110                |
|20 |miscellaneous_charge |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |amount                |sac_details.SAC_AMOUNT                  |Per Unit Quantity, chargeCode =   I131                |
|21 |extended_price       |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |extendedCost          |invoice_line_items.EXTENDED_COST        |Calculate if Null or col omitted                      |
|22 |packs_per_case       |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |packsPerCase          |invoice_line_items.PACKS_PER_CASE       |Per Unit Quantity                                     |
|23 |County_tax           |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |amount                |sac_details.SAC_AMOUNT                  |Per Unit Quantity, chargeCode =   H730                |
|24 |City_tax             |Numeric – up to 4 decimal places      |2.73 or 2.7300                |Optional              |amount                |sac_details.SAC_AMOUNT                  |Per Unit Quantity , chargeCode =  H630                |
