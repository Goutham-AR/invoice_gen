Quickbooks Inbound 
##**Quickbooks converter Differences**
The only key differences I can identify between the files and translation are in the column headings as listed below:
 
* *Source Name* replaces *Name* for Customer Number and Description
* *Item* is a separate column that if populated can be used to for Item Number
* *Item Description* Replaces both *Product/Service* and *Memo Description*
 
 
##**File Format Overview**
 
 
**File Type**: Tab Delimited TXT exported from Excel by the vendor. Data can be imported back into Excel using Tab Delimited CSV for legibility
 
##**QTY Logic**
 
This file is essentially an AR Ledger designed to net back to zero vs a fixed format file designed for invoice submission. As such, there are files containing line items written to the file in once, twice, or in triplicate, with reversal entries intended to reconcile against the actual sale line items.
 
Suggested logic for loading the quantity and price will be outlined below:
 
*Scenario 1: Line Items written in triplicate:*
 
**Step 1:** Invert the QTY values (change the negatives to positives and positives to negatives)
 
**Step 2:** After QTY value inversion, sum the line items in triplicate and load the resulting single line item
 
 
*Column Separated Example:*
 
**Raw (what is contained in the file):**
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**-1**|**96**|
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**-1**|**48**|
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**1** |**48** |
 
**Actions for loading by line item:**
|**1** |**96**| QTY inverted
|**1** |**48**| QTY inverted
|**-1**|**48**| QTY inverted
 
**96 + 48 - 48 = QTY 1/96 Sales Price net to load as single line item**
 
*Scenario 2: Line Items written in duplicate:*
 
**Step 1:** Invert the QTY values (change the negatives to positives and positives to negatives)
 
**Step 2:** After QTY value inversion, sum the line items in triplicate and load the resulting single line item
 
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**-1**|**96**|
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**1**|**48**|
 
**Actions for loading by line item:**
|**1** |**96**| QTY inverted
|**-1** |**48**| QTY inverted
 
**96 - 48 = QTY 1/48 Sales Price net to load as single line item**
 
*Scenario 3: Standard Single Line Items (1 instance per invoice):*
 
**Step 1:** Invert the QTY value (change the negative to positive)
 
**Step 2:** After QTY value inversion, load the single line item
 
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**-1**|**96**|
 
 
**Actions for loading by line item:**
|**1** |**96**| QTY inverted
 
**QTY 1/96 Sales Price net to load as single line item into Databricks**
 
 
*Scenario 4: Zero QTY and Zero Sales Price Line Items*
 
All line items containing 0 Sales Price values should be omitted from load.
 
*Column Separated Examples:*
 
0 Sales Price, negative qty:
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**-1**|**0**|
 
 
0 Sales Price, positive qty:
|Flavor 32oz:32oz Pouch of Mango-Habanero Barmalade - 6 units	|**1**|**0**|
 
 
##**Credit/Return Logic**
 
Consistent with QTY logic outlined above, Credit/Return line items are written as positive quantity and cost. Once the QTY value has been inverted to negative, the line item will process as a (-) Credit or return, subtracting from the net invoice total.
 
*Column Separated Example:*
 
Lemon Glow 1/6 BBL Keg |5 | 59.5
Oh Sure    1/6 BBL Keg |3 | 59.5
Pool Party 1/6 BBL Keg |3 | 56
Oh Sure    1/2 BBL Keg |1 | 129.5
Greenskeep 1/2 BBL Keg |1 | 129.5
Keg Deposit 	       |13| 30
 
**Actions for loading by line item:**
 
|-5 | 59.5 |  - QTY Inverted: -297.5
|-3 | 59.5 |  - QTY Inverted: -178.5
|-3 | 56   |  - QTY Inverted: -168
|-1 | 129.5|  - QTY Inverted: -129.5
|-1 | 129.5|  - QTY Inverted: -129.5
|-13| 30   |  - QTY Inverted: -390
         **Net Invoice Total: -1293.00**
 
         
##**Invoice Record Separation**
 
Invoices will be logically grouped into 1 record set per invoice and separated by 2 blank lines between invoice record sets.
 
##**Column Headings, order, and records**
Column headers should be present in this file, and representative of the data contained underneath each.
 
Columns are not written in a fixed order.
 
There are occasionally unsupported extra columns added, with/without data. These columns should be omitted from ingestion.
 
 
There are 4 levels of records written to the file:
 
1) *Column Headings:* Always written to line 1 of the file
2) *Invoice Header:* 1st line of each invoice record, contain required field values as defined in the column headings. 
3) *Line Item Details:* Written under the Invoice Header, contain required field values as defined in the column headings
4) *Invoice Footer:* Reserved for Tax, but not required/electively used as needed
 
##**Unit of Measure**
Unit of Measure (UOM) is not sent in this file. It is queried from FTS.VENDOR_PRODUCT_CATALOG table using Vendor's FTS_ID and Product Number in Legacy.  If no value is found, the Unit of Measure assignment defaults to "EA"
 
##**Product Description and Item Number**
* Load Item Number from the *Item* column if data is present
* Load Item Description from *Item Description* column if data is present
* Source Item Number from *Item Description* if *Item* is null
* Source Item Description from the *Item* column if *Item Description* is null
 
##**Customer Name and Customer Number**
Load both Customer Name and Customer Number from the *Source Name* column as outlined in the charted schema below.
 
 
##**Charted File Schema**
 
|Data Location    |Column Heading            |Data Description                           |Data Type                   |Data Example                     |Mandatory or Optional?|Entity Col           |Silver Table.Col                        |Notes                                 |
|-----------------|--------------------------|-------------------------------------------|----------------------------|---------------------------------|----------------------|---------------------|----------------------------------------|--------------------------------------|
|Invoice Header   |Trans #                   |Not Used                                   |                            |                                 |                      |                     |                                        |ignore/omit                           |
|Invoice Header   |Type                      |Not Used                                   |                            |                                 |                      |                     |                                        |ignore/omit                           |
|Invoice Header   |Date                      |Invoice Date                               |M/DD/YYYY                   |3/15/2005                        |Mandatory             |invoiceDate          |invoice_summary.INVOICE_DATE            |                                      |
|Invoice Header   |Num                       |Invoice Number                             |Alphanumeric                |2124                             |Mandatory             |invoiceNumber        |invoice_summary.INVOICE_NUMBER          |                                      |
|Invoice Header   |P. O. #                   |Purchase Order Number                      |Alphanumeric                |212144AN                         |Optional              |poNumber             |invoice_summary.PO_NUMBER               |                                      |
|Invoice Header   |Source Name               |Customer Name                              |Alphanumeric                |Fogo de Chao - Brea CA           |Optional              |shipTo.name          |invoice_summary.SHIP_TO_NAME            |                                      |
|Invoice Header   |Source Name               |Customer Number                            |Alphanumeric                |Fogo de Chao - Brea CA           |Mandatory             |vendorStoreId        |invoice_summary.SHIP_TO_VENDOR_STORE_ID |                                      |
|Invoice Header   |Due Date                  |Invoice Due Date                           |M/DD/YYYY                   |3/15/2005                        |Optional              |invoiceDueDate       |invoice_summary.TERM_NET_DUE_DATE       |                                      |
|Line Item Details|Item                      |Vendor Product Number                      |Alphanumeric                |Chelsea B. Drugstore Mixed 6 pack|Mandatory             |vendorProductNumber  |invoice_line_items.VENDOR_PRODUCT_NUMBER|                                      |
|Line Item Details|Item Description          |Product Description                        |Alphanumeric                |Chelsea B. Drugstore Mixed 6 pack|Mandatory             |description          |invoice_line_items.ITEM_DESCRIPTION     |                                      |
|Line Item Details|QTY                       |Unit Quantity Invoiced                     |Numeric                     |25                               |Mandatory             |quantity             |invoice_line_items.ITEM_QUANTITY        |                                      |
|Line Item Details|Sales Price               |Unit Price                                 |Numeric                     |2.73                             |Mandatory             |cost                 |invoice_line_items.ITEM_COST            |                                      |
|Invoice Header   |Debit                     |Not Used                                   |                            |                                 |                      |                     |                                        |ignore/omit                           |
|Invoice Header   |Credit                    |Not Used                                   |                            |                                 |                      |                     |                                        |ignore/omit                           |
|Line Item Details|UPC CODE                  |1 col source for UPC                       |String                      |000001801262                     |Optional              |upcCaseCode          |invoice_line_items.UPC_CASE_CODE        |                                      |
|Invoice Header   |Memo                      |Not Used                                   |                            |                                 |                      |                     |                                        |ignore/omit                           |
