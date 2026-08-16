US Foods
##**Key Differences from Fintech Standard 810 File Spec**
 
###**BIG Segment**
 
US Foods leverages the BIG07 segment as the basis for identifying Credit and Debit invoices whereas Fintech does not map this element.
###**Credit Logic**
 
US Foods is leveraging the BIG07 segment as the basis for identifying Credit and Debit invoices.
 
- We should use BIG07 as the principal credit/debit indicator when available
- US foods writes both line-item quantity (IT102) and price (IT104) to IT1 as negative values on Credit line-items
 
**Credit value definitions:**
 
**DI:** Debit Invoice
**CR:** Credit Invoice
 
###**IT1 (Item Details) Segment**
 
 
####**IT103 Unit of Measure (UOM)**
 
While the IT1 segment and element positions match the standard 810 Fintech file specifications, they include an additional unit of measure we will need to capture, specifically LB (pound).
 
We will initially convert LB UOM to EA for outbound integration output purposes but should still capture the LB value reference in the DB and plan to aggregate this value when it becomes available for outbound maps.
 
 
|**Code**|**Name**|**Action**|
|----|--------|-----|
|CA  |Case    |Standard|
|EA  |Each    |Standard|
|LB  |Pound   |Convert to EA|

#####**LB UOM Quantity**
 
The line-item quantity element (IT102) for products with LB as UOM can be written as a decimal number. The line-item price is calculated to the hundredth through traditional rounding rules.
 
_Example:_
 
38.63 LB UOM * $2.31 = 89.2353, rounded to the nearest hundredth = $89.24, matching the net line-item total reflected in CTP03
 
 
#####**CTP03 Element Line-Item Net Reconciliation**
 
To verify line-item net totals for LB UOM line items (or for all line items as a blanket rule), we can use the CTP03 element providing the net line-item price.
 
We do not need to map this data to the invoice ingestion entity, although we should use it to verify calculations. 
~~**IT106/IT107 (Item Number Qualifier/ID)**~~
~~The Vendor Product Number (VIN) Qualifier and ID are written to~~ ~~IT106/IT107 in place of IT110/IT111 as in the standard 810~~
 
~~**IT110/IT111 (Container UPC/EAN Qualifier/ID)**~~
~~The Container UPC/EAN Qualifier and ID are written to~~ ~~IT110/IT111 in place of IT110/IT111 as in the standard 810~~
 
####**IT123 Brand**
Brand Label (name) is captured in IT123, which is also mapped to our db in the schema below

###**Tax**
 
####**Line-Item level taxes**
US Foods is providing a separate segment (TXI) in the 810 on the line-item level representative of net taxes to sum against each line-item total in place of rolling taxes under line-item SAC segments. This new segment is mapped in the schema for reference
 
State and local taxes are also captured under a single instance of the segment per line-item.
 
We will map TXI elements to SAC code H850 and load the code and tax amount to the SAC table as outlined in the file schema
 
####**Invoice Summary level taxes**
Invoice Summary level taxes are captured traditionally as SAC records written to the bottom of invoice record sets where assessed.
 
1 of 2 possible indicators are provided at TXI101 on the summary-level to identify the Tax record type. Only 1 is representative of a summary level tax which should be loaded.
 
 
**Summary TXI Record Type 1:** **LS:** This record is representative of State and local sales tax assessed against the net sum of the invoice and **should be loaded as a summary SAC record.**
 
_Example:_
~~~~
TXI*LS*.20~
~~~~
 
**Summary TXI Record Type 2:** **TX:** This record is representative of the _sum of all taxes assessed on the line item and summary level of a given invoice._
 
This record can be used as reference or for reconciliation purposes, _**but should not be loaded at ingest.**_
 
_Example:_
 
~~~~
TXI*TX*5.41~
~~~~

 
 
SAC Codes for taxes are defined as follows:
|**SAC Code**|**Tax Type**  |
|----|----------------------|
|H625| Tax - Beverage Tax   | 
|H840| Tax on Transportation| 
|H850| Tax                  |
 
####**SAC Code Definitions**
 
US foods uses an expanded list of SAC codes and definitions we will need to add to our existing set, as defined below:
 
|**SAC Code**|**Description**                  |
|----|-----------------------------------------|
|A170|Adjustments                              |
|B950|Damaged Merchandise                      |
|C040|Delivery                                 |
|C650|Energy Surcharge (Fuel Adjustment Factor)|
|D240|Freight                                  |
|F340|Pick/Up                                  |
|F800|Promotional Allowance                    |
|G970|Small Order Charge                       |
|H625| Tax - Beverage Tax                      |
|H840| Tax on Transportation                   |
|H850| Tax                                     |
 
##**Charted File Schema**
 
**Interchange (ISA)**
|Name                                    |Position|Min/Max|Data Type   |Field Comments       |Example         |Entity Col    |Silver Table.Col|
|----------------------------------------|--------|-------|------------|---------------------|----------------|--------------|----------------|
|Interchange (ISA)                       |        |       |            |                     |ISA*            |              |                |
|Authorization Information Qualifier     |1       |2/2    |AlphaNumeric|                     |00*             |              |                |
|Authorization Information               |2       |10/10  |AlphaNumeric|                     |          *     |              |                |
|Security Information Qualifier          |3       |2/2    |AlphaNumeric|                     |00*             |              |                |
|Security Information Qualifier          |4       |10/10  |AlphaNumeric|                     |          *     |              |                |
|Interchange ID Qualifier                |5       |2/2    |AlphaNumeric|                     |ZZ*             |ISAQualifier  |                |
|Interchange Sender ID                   |6       |15/15  |AlphaNumeric|                     |GOODYGOODYINC  *|interchangeID |NA              |
|Interchange ID Qualifier                |7       |2/2    |AlphaNumeric|                     |01*             |              |                |
|Interchange Receiver ID                 |8       |15/15  |AlphaNumeric|                     |616056461      *|              |                |
|Interchange Date                        |9       |6/6    |Date        |YYMMDD               |221221*         |              |                |
|Interchange Time                        |10      |4/4    |Time        |HHMM - 24 Hour Format|1000*           |              |                |
|Interchange Control Standards Identifier|11      |1/1    |Identifier  |                     |U*              |              |                |
|Interchange Conrol Version Number       |12      |5/5    |Identifier  |                     |00401*          |              |                |
|Interchange Control Number              |13      |9/9    |Numeric     |                     |000000330*      |              |                |
|Acknowledgement Requested               |14      |1/1    |Identifier  |                     |0*              |              |                |
|Usage Indicator                         |15      |1/1    |Identifier  |                     |P*              |              |                |
|Component Element Separator             |16      |1/1    |AlphaNumeric|                     |>~              |              |                |
 
 
**Group (GS)**  
|Name                      |Position|Min/Max|Data Type   |Field Comments       |Example       |Entity Col    |Silver Table.Col            |
|--------------------------|--------|-------|------------|---------------------|--------------|--------------|----------------------------|
|Group (GS)                |        |       |            |                     |GS*           |              |                            |
|Functional Identifier Code|1       |2/2    |Identifier  |                     |IN*           |              |                            |
|Application Sender Code   |2       |2/15   |AlphaNumeric|                     |GOODYGOODYINC*|GSRecieverCode|NA                          |
|Application Receiver Code |3       |2/15   |AlphaNumeric|                     |616056461*    |Fintech ISA ID|Always 616056461            |
|Date (YYYYMMDD)           |4       |8/8    |Date        |YYYYMMDD             |20221221*     |submittedAt   |invoice_summary.PROCESS_DATE|
|Time (HHMM)               |5       |4/8    |Time        |HHMM - 24 Hour Format|100001*       |              |                            |
|Group Control Number      |6       |1/9    |AlphaNumeric|                     |329*          |              |                            |
|Responsible Agency        |7       |1/2    |Identifier  |                     |X*            |              |                            |
|Version                   |8       |1/12   |Identifier  |                     |004010~       |              |                            |
 
 
**Transaction Set Header (ST)**
|Name                           |Position|Min/Max|Data Type   |Field Comments|Example|Entity Col      |Silver Table.Col|
|-------------------------------|--------|-------|------------|--------------|-------|----------------|----------------|
|Transaction Set Header (ST)    |        |       |            |              |ST*    |                |                |
|Transaction Set Identifier Code|1       |3/3    |Identifier  |              |810*   |                |                |
|Transaction Set Control Number |2       |4/9    |AlphaNumeric|              |1   ~  |997ControlNumber|                |
 
 
**Beginning Segment for Invoice (BIG)**
|Name                               |Position|Min/Max|Data Type|Field Comments|Example   |Entity Col        |Silver Table.Col                  |
|-----------------------------------|--------|-------|---------|--------------|----------|----------------------|--------------------------------------|
|Beginning Segment for Invoice (BIG)|        |       |         |              |BIG*      |                      |                                      |
|Invoice Date                       |1       |1/1    |DT       |Date          |20221221* |invoiceDate           |invoice_summary.INVOICE_DATE          |
|Invoice Number                     |2       |1/18   |AN       |AlphaNumeric  |902240278*|invoiceNumber         |invoice_summary.INVOICE_NUMBER        |
|PO Date                            |3       |1/2    |DT       |Date          |20221221* |poDate                |invoice_summary.PO_DATE               |
|PO Number                          |4       |3/3    |AN       |AlphaNumeric  |902240278*|poNumber              |invoice_summary.PO_NUMBER             |
|Credit/Debit Indicator             |7       |2/2    |AN       |AlphaNumeric  | CR or DI~|NA                    |NA (see Credit/Return section of wiki)|
 
 
**Name (N1)**
|Name                         |Position|Min/Max|Data Type   |Field Comments|Example                 |Entity Col     |Silver Table.Col                       |
|-----------------------------|--------|-------|------------|--------------|------------------------|---------------|---------------------------------------|
|Name (N1)                    |        |       |            |              |N1*                     |               |                                       |
|Entity Identitifier Code     |1       |2/2    |Identifier  |ST, SF, RE    |ST*                     |               |                                       |
|Location/ Name               |2       |1/60   |AlphaNumeric|              |JALAPENO TREE - KILGORE*|shipTo.name    |invoice_summary.SHIP_TO_NAME           |
|Identification Code Qualifier|3       |1/2    |Identifier  |9             |92*                     |               |                                       |
|Customer Number              |4       |1/80   |AlphaNumeric|              |58786~                  |vendorStoreId  |invoice_summary.SHIP_TO_VENDOR_STORE_ID|
 
 
**Address (N3)**
|Name        |Position|Min/Max|Data Type   |Field Comments|Example       |Entity Col        |Silver Table.Col                |
|------------|--------|-------|------------|--------------|--------------|------------------|--------------------------------|
|Address (N3)|        |       |            |              |N3*           |                  |                                |
|Address 1   |1       |1/40   |AlphaNumeric|              |1520 HWY 259N~|shipTo.address1   |invoice_summary.BILL_TO_ADDRESS1|
|Address 2   |2       |1/40   |AlphaNumeric|              |              |shipTo.address2   |invoice_summary.BILL_TO_ADDRESS2|
 
 
**City/State (N4)**
|Name           |Position|Min/Max|Data Type   |Field Comments|Example |Entity Col    |Silver Table.Col                       |
|---------------|--------|-------|------------|--------------|--------|--------------|---------------------------------------|
|City/State (N4)|        |       |            |              |N4*     |              |                                       |
|City           |1       |1/40   |AlphaNumeric|              |KILGORE*|shipTo.city   |invoice_summary.BILL_TO_CITY           |
|State          |2       |2/2    |Identifier  |              |TX*     |shipTo.state  |invoice_summary.BILL_TO_STATE          |
|Zip Code       |3       |5/5    |AlphaNumeric|              |75662~  |shipTo.zip    |invoice_summary.BILL_TO_ZIP            |
 
**Name (N1)**
|Name                         |Position|Min/Max|Data Type   |Field Comments|Example    |Entity Col    |Silver Table.Col|
|-----------------------------|--------|-------|------------|--------------|-----------|--------------|----------------|
|Name (N1)                    |        |       |            |              |N1*        |              |                |
|Entity Identitifier Code     |1       |2/2    |Identifier  |ST, SF, RE    |RE*        |              |                |
|Location/Distributor Name    |2       |1/60   |AlphaNumeric|              |*          |              |                |
|Identification Code Qualifier|3       |1/2    |Identifier  |9             |92*        |              |                |
|Interchange ID               |4       |1/80   |AlphaNumeric|              |GOODYGOODY~|interchangeID |NA              |
 
 
**Payment Terms (ITD)**
|Name               |Position|Min/Max|Data Type|Field Comments|Example  |Entity Col      |Silver Table.Col                 |
|-------------------|--------|-------|---------|--------------|---------|----------------|---------------------------------|
|Payment Terms (ITD)|        |       |         |              |ITD******|                |                                 |
|Due Date           |6       |8/8    |Date     |YYYYMMDD      |20221222~|invoiceDueDate  |invoice_summary.TERM_NET_DUE_DATE|
 
 
**Item Detail (IT1)**
|Name                               |Position|Min/Max|Data Type   |Field Comments    |Example        |Entity Col           |Silver Table.Col                        |
|-----------------------------------|--------|-------|------------|------------------|---------------|---------------------|----------------------------------------|
|Item Detail (IT1)                  |        |       |            |                  |IT1*           |                     |                                        |
|Line Item Number                   |1       |1/20   |AlphaNumeric|                  |0008*          |                     |                                        |
|Quantity                           |2       |1/10   |Numeric     |                  |1*             |quantity             |invoice_line_items.ITEM_QUANTITY        |
|Unit of Measure                    |3       |2/2    |Identifier  |CA, EA, LB        |CA*            |unitOfMeasure        |invoice_line_items.ITEM_UNIT_OF_MEASURE |
|Unit Price                         |4       |1/17   |Numeric     |                  |35.8800*       |cost                 |invoice_line_items.ITEM_COST            |
|Basis of Unit Price code           |5       |2/2    |Alpha       |PE,PP,UM          |PE*            |                     |                                        |
|UPC Qualifier                      |6       |2/2    |Identifier  |VN                |VN*            |                     |                                        |
|UPC                                |7       |1/14   |AlphaNumeric|Pack UPC          |073310202044*  |vendorProductNumber  |invoice_line_items.VENDOR_PRODUCT_NUMBER|
|UPC Qualifier                      |8       |2/2    |Identifier  |IN                |IN*            |                     |                                        |
|UPC                                |9       |1/14   |AlphaNumeric|Case UPC          |073310202044*  | upcCaseCode         |                                        |
|Item Number Qualifier              |10      |2/2    |Identifier  |UK                |UK*            |                     |                                        |
|Item              Number           |11      |1/48   |AlphaNumeric|VIN               |00073310202044*|vendorProductNumber  |invoice_line_items.UPC_CASE_CODE        |
|Manufacturers Part Number Qualifier|12      |2/2    |Identifier  |MG                |MG*            |                     |                                        |
|Manufacturers Part Number          |13      |1/48   |AlphaNumeric|Part Number       |20204*         |                     |                                        |
|Substitute Product Number Qualifier|14      |2/2    |Identifier  |SR                |SR*            |                     |                                        |
|Substitute Product Number          |15      |1/48   |AlphaNumeric|Part Number       |11996*******   |                     |                                        |
|Brand Label Qualifier              |22      |2/2    |Identifier  |BL                |BL*            |                     |                                        |
|Brand Label                        |23      |1/48   |AlphaNumeric|Brand Label       |ACCLAIM~       |brandName            |                                        |
 
 
 
**Product/Item Description (PID)**
|Name                          |Position|Min/Max|Data Type   |Field Comments|Example                             |Entity Col      |Silver Table.Col                   |
|------------------------------|--------|-------|------------|--------------|------------------------------------|----------------|-----------------------------------|
|Product/Item Description (PID)|        |       |            |              |PID*                                |                |                                   |
|Qualifier                     |1       |1/1    |Identifier  |F             |F****                               |                |                                   |
|Description                   |5       |1/80   |AlphaNumeric|              |1 L CROWN ROYAL CANADIAN WHISKY 80°~|description     |invoice_line_items.ITEM_DESCRIPTION|

**Taxes (TXI)**
|Name                   |Position|Min/Max|Data Type |Field Comments |Example |Entity Col          |Silver Table.Col           |
|-----------------------|--------|-------|----------|---------------|--------|--------------------|---------------------------|
|Taxes (TXI)            |        |       |          |               |TXI*    |                    |                           |
|Tax Type Code          |1       |2/2    |Identifier|LS             |LS*     |chargeCode (H850)   |sac_details.SAC_CHARGE_CODE|
|Monetary Amount        |2       |2/18   |Double    |Decimal Used   |1.90*   |amount              |sac_details.TotalAdjustment|
|Percent                |3       |1/10   |Double    |Decimal Used   |8.25~   |                    |                           |
 
 
**Service/Allowance (SAC)**
|Name                   |Position|Min/Max|Data Type |Field Comments |Example |Entity Col          |Silver Table.Col           |
|-----------------------|--------|-------|----------|---------------|--------|--------------------|---------------------------|
|Service/Allowance (SAC)|        |       |          |               |SAC*    |                    |                           |
|Allowance/Charge Code  |1       |1/1    |Identifier|A/C            |A* or C*|chargeIndicator     |NA                         |
|SAC Code               |2       |4/4    |Identifier|               |C110*   |chargeCode          |sac_details.SAC_CHARGE_CODE|
|Total                  |5       |1/6    |Numeric   |Implied decimal|987*    |amount              |sac_details.TotalAdjustment|
 
 
**PO4**
|Name                   |Position|Min/Max|Data Type |Field Comments |Example |Entity Col    |Silver Table.Col                 |
|-----------------------|--------|-------|----------|---------------|--------|--------------|---------------------------------|
|Pack (PO4)             |        |       |          |               |PO4*    |              |                                 |
|Packs Per Case         |1       |1/2    |Numeric   |         |12*     |unitsPerPack  |invoice_line_items.UNITS_PER_PACK|
 
 
**Total Dollar (TDS)**
|Name              |Position|Min/Max|Data Type|Field Comments |Example|Entity Col   |Silver Table.Col             |
|------------------|--------|-------|---------|---------------|-------|-------------|-----------------------------|
|Total Dollar (TDS)|        |       |         |               |TDS*   |             |                             |
|Invoice Total     |1       |1/15   |Numeric  |Implied decimal|27273~ |invoiceTotal |invoice_summary.INVOICE_TOTAL|
 
 
**Transaction Totals (CTT)**
|Name                           |Position|Min/Max|Data Type|Field Comments |Example|Entity Col|Silver Table.Col          |
|-------------------------------|--------|-------|---------|---------------|-------|----------|--------------------------|
|Transaction Totals (CTT)       |        |       |         |               |CTT*   |          |                          |
|Number of Line Items           |1       |1/6    |Numeric  |               |2**    |itemCount |invoice_summary.ITEM_COUNT|
|Net Weight                     |3       |1/10   |Numeric  |Decimal Incuded|12.88* |          |                          |
|Net Weight basis of measurement|1       |1/6    |Numeric  |               |LB~    |          |                          |
 
 
**Transaction Set Trailer (SE)**
|Name                          |Position|Min/Max|Data Type   |Field Comments|Exampe|Entity Col|Silver Table.Col|
|------------------------------|--------|-------|------------|--------------|------|----------|----------------|
|Transaction Set Trailer (SE)  |        |       |            |              |SE*   |          |                |
|Number of Included Segments   |1       |1/10   |Numeric     |              |22*   |          |                |
|Transaction Set Control Number|2       |4/9    |AlphaNumeric|              |1   ~ |          |                |
 
 
**Functional Group Trailer (GE)**
|Name                               |Position|Min/Max|Data Type   |Field Comments|Example|Entity Col|Silver Table.Col|
|-----------------------------------|--------|-------|------------|--------------|-------|----------|----------------|
|Functional Group Trailer (GE)      |        |       |            |              |GE*    |          |                |
|Number of Transaction Sets Included|1       |1/6    |Numeric     |              |1*     |          |                |
|Group Control Number               |2       |1/9    |Numeric     |              |329~   |          |                |
 
 
**Interchange Control Trailer (IEA)**
|Name                                |Position|Min/Max|Data Type|Field Comments|Example   |Entity Col|Silver Table.Col|
|------------------------------------|--------|-------|---------|--------------|----------|----------|----------------|
|Interchange Control Trailer (IEA)   |        |       |         |              |IEA*      |          |               |
|Number of Included Functional Groups|1       |1/5    |Numeric  |              |1*        |          |               |
|Interchange Control Number          |2       |9/9    |Numeric  |              |000000330~|          |               |
 
 
|Data Type ID|Data Type Name|Data Type Description                                           |
|------------|--------------|----------------------------------------------------------------|
|AN          |AlphaNumeric  |Any letters, digits, special characters, and control characters.|
|DT          |Date          |Check field comments                                            |
|ID          |Identifier    |Alphabetic, numeric, or alphanumeric identifier                 |
|N           |Numeric       |Numeric. Can include decimal mark.                              |
|TM          |Time          |HHMM - 24 Hour Format                                           |
 
CTP*1*LB*89.24~              // CTP01=Line ref, CTP02=UOM, CTP03=Net total 
