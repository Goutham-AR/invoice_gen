EDI 810
File can be manually loaded through the web portal or sent via FTP.  AS2 is available but is not generally used.  SFTP is not supported.
 
##**Credit/Return Logic**
 
A negative number written to the IT102 Element (Quantity)is the standard indicator for line item credits or returns.
 
A negative cost value written to the IT104 Element (Price) is a nonstandard indicator of item credits or returns, but accepted.

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
|-----------------------------------|--------|-------|---------|--------------|----------|----------------------|----------------------------------|
|Beginning Segment for Invoice (BIG)|        |       |         |              |BIG*      |                      |                                  |
|Invoice Date                       |1       |1/1    |DT       |Date          |20221221* |invoiceDate           |invoice_summary.INVOICE_DATE      |
|Invoice Number                     |2       |1/18   |AN       |AlphaNumeric  |902240278*|invoiceNumber         |invoice_summary.INVOICE_NUMBER    |
|PO Date                            |3       |1/2    |DT       |Date          |20221221* |poDate                |invoice_summary.PO_DATE           |
|PO Number                          |4       |3/3    |AN       |AlphaNumeric  |902240278*|poNumber              |invoice_summary.PO_NUMBER         |
|Reference Invoice Number           |10      |1/8    |AN       |AlphaNumeric  |111222333~|referenceInvoiceNumber|invoice_summary.REF_INVOICE_NUMBER|
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
|Name                 |Position|Min/Max|Data Type   |Field Comments    |Example     |Entity Col           |Silver Table.Col                       |
|---------------------|--------|-------|------------|------------------|------------|---------------------|---------------------------------------|
|Item Detail (IT1)    |        |       |            |                  |IT1*        |                     |                                       |
|Line Item Number     |1       |1/3    |AlphaNumeric|                  |*           |                     |                                       |
|Quantity             |2       |1/10   |Numeric     |                  |1*          |quantity             |invoice_line_items.ITEM_QUANTITY       |
|Unit of Measure      |3       |2/2    |Identifier  |EA, BO, CA, KE, DS|BO*         |unitOfMeasure        |invoice_line_items.ITEM_UNIT_OF_MEASURE|
|Unit Price           |4       |1/11   |Numeric     |                  |35.8800*    |cost                 |invoice_line_items.ITEM_COST           |
|UPC Qualifier        |6       |2/2    |Identifier  |UP                |UP*         |                     |                                       |
|UPC                  |7       |1/14   |Identifier  |Pack UPC          |08700000724*|upcPackCode          |invoice_line_items.UPC_PACK_CODE       |
|UPC Qualifier        |8       |2/2    |Identifier  |UP                |UP*         |                     |                                       |
|UPC                  |9       |1/14   |Identifier  |Case UPC          |08700000724*|upcCaseCode          |invoice_line_items.UPC_CASE_CODE       |
|Item Number Qualifier|10      |2/2    |Identifier  |VN                |VN*         |                     |                                       |
|Item Number          |11      |1/48   |AlphaNumeric|Distributor SKU   |1413~       |vendorProductNumber  |invoice_line_items.LINE_ITEM_NUMBER    |
**Product/Item Description (PID)**
|Name                          |Position|Min/Max|Data Type   |Field Comments|Example                             |Entity Col      |Silver Table.Col                   |
|------------------------------|--------|-------|------------|--------------|------------------------------------|----------------|-----------------------------------|
|Product/Item Description (PID)|        |       |            |              |PID*                                |                |                                   |
|Qualifier                     |1       |1/1    |Identifier  |F             |F****                               |                |                                   |
|Description                   |10      |1/80   |AlphaNumeric|              |1 L CROWN ROYAL CANADIAN WHISKY 80°~|description     |invoice_line_items.ITEM_DESCRIPTION|
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
|Packs Per Case         |1       |1/2    |Numeric   |Implied decimal|12*     |unitsPerPack  |invoice_line_items.UNITS_PER_PACK|
**Total Dollar (TDS)**
|Name              |Position|Min/Max|Data Type|Field Comments |Example|Entity Col   |Silver Table.Col             |
|------------------|--------|-------|---------|---------------|-------|-------------|-----------------------------|
|Total Dollar (TDS)|        |       |         |               |TDS*   |             |                             |
|Invoice Total     |1       |1/1    |Numeric  |Implied decimal|27273~ |invoiceTotal |invoice_summary.INVOICE_TOTAL|
**Transaction Totals (CTT)**
|Name                    |Position|Min/Max|Data Type|Field Comments|Example|Entity Col|Silver Table.Col          |
|------------------------|--------|-------|---------|--------------|-------|----------|--------------------------|
|Transaction Totals (CTT)|        |       |         |              |CTT*   |          |                          |
|Number of Line Items    |1       |1/4    |Numeric  |              |7~     |itemCount |invoice_summary.ITEM_COUNT|
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
Above are the fields used in EDI and the columns and its positions
 
SE*<segment_count>*<transaction_set_control_number>~
The first element (segment_count) = total number of segments from ST to SE inclusive.
The second element is just the control number (matches the one in ST).
 
SAC is implied decimal format.
For SAC codes if the Allowance/Charge Code is A, then the amount should be subtracted. If it is C then addition is to be performed.
