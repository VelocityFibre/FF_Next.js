# Database Schema Validation Report

Generated: 2025-08-25T13:12:59.740Z

## Issues Found: 140


### HIGH: rfqs.response_deadline
- **Type**: MISSING_COLUMN
- **Description**: Column 'response_deadline' expected by application but missing from database

### HIGH: rfqs.extended_deadline
- **Type**: MISSING_COLUMN
- **Description**: Column 'extended_deadline' expected by application but missing from database

### HIGH: rfqs.closed_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'closed_at' expected by application but missing from database

### HIGH: rfqs.issued_by
- **Type**: MISSING_COLUMN
- **Description**: Column 'issued_by' expected by application but missing from database

### HIGH: rfqs.delivery_terms
- **Type**: MISSING_COLUMN
- **Description**: Column 'delivery_terms' expected by application but missing from database

### HIGH: rfqs.validity_period
- **Type**: MISSING_COLUMN
- **Description**: Column 'validity_period' expected by application but missing from database

### HIGH: rfqs.currency
- **Type**: MISSING_COLUMN
- **Description**: Column 'currency' expected by application but missing from database

### HIGH: rfqs.technical_requirements
- **Type**: MISSING_COLUMN
- **Description**: Column 'technical_requirements' expected by application but missing from database

### HIGH: rfqs.responded_suppliers
- **Type**: MISSING_COLUMN
- **Description**: Column 'responded_suppliers' expected by application but missing from database

### HIGH: rfqs.item_count
- **Type**: MISSING_COLUMN
- **Description**: Column 'item_count' expected by application but missing from database

### HIGH: rfqs.total_budget_estimate
- **Type**: MISSING_COLUMN
- **Description**: Column 'total_budget_estimate' expected by application but missing from database

### HIGH: rfqs.lowest_quote_value
- **Type**: MISSING_COLUMN
- **Description**: Column 'lowest_quote_value' expected by application but missing from database

### HIGH: rfqs.highest_quote_value
- **Type**: MISSING_COLUMN
- **Description**: Column 'highest_quote_value' expected by application but missing from database

### HIGH: rfqs.average_quote_value
- **Type**: MISSING_COLUMN
- **Description**: Column 'average_quote_value' expected by application but missing from database

### HIGH: rfqs.awarded_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'awarded_at' expected by application but missing from database

### HIGH: rfqs.awarded_to
- **Type**: MISSING_COLUMN
- **Description**: Column 'awarded_to' expected by application but missing from database

### HIGH: rfqs.award_notes
- **Type**: MISSING_COLUMN
- **Description**: Column 'award_notes' expected by application but missing from database

### LOW: rfqs.closing_date
- **Type**: EXTRA_COLUMN
- **Description**: Column 'closing_date' exists in database but not expected by application

### LOW: rfqs.terms_conditions
- **Type**: EXTRA_COLUMN
- **Description**: Column 'terms_conditions' exists in database but not expected by application

### LOW: rfqs.delivery_requirements
- **Type**: EXTRA_COLUMN
- **Description**: Column 'delivery_requirements' exists in database but not expected by application

### LOW: rfqs.total_items
- **Type**: EXTRA_COLUMN
- **Description**: Column 'total_items' exists in database but not expected by application

### LOW: rfqs.responses_received
- **Type**: EXTRA_COLUMN
- **Description**: Column 'responses_received' exists in database but not expected by application

### HIGH: rfq_items.id
- **Type**: MISSING_COLUMN
- **Description**: Column 'id' expected by application but missing from database

### HIGH: rfq_items.rfq_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'rfq_id' expected by application but missing from database

### HIGH: rfq_items.boq_item_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'boq_item_id' expected by application but missing from database

### HIGH: rfq_items.project_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'project_id' expected by application but missing from database

### HIGH: rfq_items.line_number
- **Type**: MISSING_COLUMN
- **Description**: Column 'line_number' expected by application but missing from database

### HIGH: rfq_items.item_code
- **Type**: MISSING_COLUMN
- **Description**: Column 'item_code' expected by application but missing from database

### HIGH: rfq_items.description
- **Type**: MISSING_COLUMN
- **Description**: Column 'description' expected by application but missing from database

### HIGH: rfq_items.category
- **Type**: MISSING_COLUMN
- **Description**: Column 'category' expected by application but missing from database

### HIGH: rfq_items.quantity
- **Type**: MISSING_COLUMN
- **Description**: Column 'quantity' expected by application but missing from database

### HIGH: rfq_items.uom
- **Type**: MISSING_COLUMN
- **Description**: Column 'uom' expected by application but missing from database

### HIGH: rfq_items.budget_price
- **Type**: MISSING_COLUMN
- **Description**: Column 'budget_price' expected by application but missing from database

### HIGH: rfq_items.specifications
- **Type**: MISSING_COLUMN
- **Description**: Column 'specifications' expected by application but missing from database

### HIGH: rfq_items.technical_requirements
- **Type**: MISSING_COLUMN
- **Description**: Column 'technical_requirements' expected by application but missing from database

### HIGH: rfq_items.acceptable_alternatives
- **Type**: MISSING_COLUMN
- **Description**: Column 'acceptable_alternatives' expected by application but missing from database

### HIGH: rfq_items.evaluation_weight
- **Type**: MISSING_COLUMN
- **Description**: Column 'evaluation_weight' expected by application but missing from database

### HIGH: rfq_items.is_critical_item
- **Type**: MISSING_COLUMN
- **Description**: Column 'is_critical_item' expected by application but missing from database

### HIGH: rfq_items.created_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'created_at' expected by application but missing from database

### HIGH: rfq_items.updated_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'updated_at' expected by application but missing from database

### HIGH: supplier_invitations.id
- **Type**: MISSING_COLUMN
- **Description**: Column 'id' expected by application but missing from database

### HIGH: supplier_invitations.rfq_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'rfq_id' expected by application but missing from database

### HIGH: supplier_invitations.supplier_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'supplier_id' expected by application but missing from database

### HIGH: supplier_invitations.project_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'project_id' expected by application but missing from database

### HIGH: supplier_invitations.supplier_name
- **Type**: MISSING_COLUMN
- **Description**: Column 'supplier_name' expected by application but missing from database

### HIGH: supplier_invitations.supplier_email
- **Type**: MISSING_COLUMN
- **Description**: Column 'supplier_email' expected by application but missing from database

### HIGH: supplier_invitations.contact_person
- **Type**: MISSING_COLUMN
- **Description**: Column 'contact_person' expected by application but missing from database

### HIGH: supplier_invitations.invitation_status
- **Type**: MISSING_COLUMN
- **Description**: Column 'invitation_status' expected by application but missing from database

### HIGH: supplier_invitations.invited_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'invited_at' expected by application but missing from database

### HIGH: supplier_invitations.viewed_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'viewed_at' expected by application but missing from database

### HIGH: supplier_invitations.responded_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'responded_at' expected by application but missing from database

### HIGH: supplier_invitations.declined_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'declined_at' expected by application but missing from database

### HIGH: supplier_invitations.access_token
- **Type**: MISSING_COLUMN
- **Description**: Column 'access_token' expected by application but missing from database

### HIGH: supplier_invitations.token_expires_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'token_expires_at' expected by application but missing from database

### HIGH: supplier_invitations.magic_link_token
- **Type**: MISSING_COLUMN
- **Description**: Column 'magic_link_token' expected by application but missing from database

### HIGH: supplier_invitations.last_login_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'last_login_at' expected by application but missing from database

### HIGH: supplier_invitations.invitation_message
- **Type**: MISSING_COLUMN
- **Description**: Column 'invitation_message' expected by application but missing from database

### HIGH: supplier_invitations.decline_reason
- **Type**: MISSING_COLUMN
- **Description**: Column 'decline_reason' expected by application but missing from database

### HIGH: supplier_invitations.reminders_sent
- **Type**: MISSING_COLUMN
- **Description**: Column 'reminders_sent' expected by application but missing from database

### HIGH: supplier_invitations.last_reminder_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'last_reminder_at' expected by application but missing from database

### HIGH: supplier_invitations.created_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'created_at' expected by application but missing from database

### HIGH: supplier_invitations.updated_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'updated_at' expected by application but missing from database

### HIGH: quotes.id
- **Type**: MISSING_COLUMN
- **Description**: Column 'id' expected by application but missing from database

### HIGH: quotes.rfq_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'rfq_id' expected by application but missing from database

### HIGH: quotes.supplier_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'supplier_id' expected by application but missing from database

### HIGH: quotes.supplier_invitation_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'supplier_invitation_id' expected by application but missing from database

### HIGH: quotes.project_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'project_id' expected by application but missing from database

### HIGH: quotes.quote_number
- **Type**: MISSING_COLUMN
- **Description**: Column 'quote_number' expected by application but missing from database

### HIGH: quotes.quote_reference
- **Type**: MISSING_COLUMN
- **Description**: Column 'quote_reference' expected by application but missing from database

### HIGH: quotes.status
- **Type**: MISSING_COLUMN
- **Description**: Column 'status' expected by application but missing from database

### HIGH: quotes.submission_date
- **Type**: MISSING_COLUMN
- **Description**: Column 'submission_date' expected by application but missing from database

### HIGH: quotes.valid_until
- **Type**: MISSING_COLUMN
- **Description**: Column 'valid_until' expected by application but missing from database

### HIGH: quotes.total_value
- **Type**: MISSING_COLUMN
- **Description**: Column 'total_value' expected by application but missing from database

### HIGH: quotes.subtotal
- **Type**: MISSING_COLUMN
- **Description**: Column 'subtotal' expected by application but missing from database

### HIGH: quotes.tax_amount
- **Type**: MISSING_COLUMN
- **Description**: Column 'tax_amount' expected by application but missing from database

### HIGH: quotes.discount_amount
- **Type**: MISSING_COLUMN
- **Description**: Column 'discount_amount' expected by application but missing from database

### HIGH: quotes.currency
- **Type**: MISSING_COLUMN
- **Description**: Column 'currency' expected by application but missing from database

### HIGH: quotes.lead_time
- **Type**: MISSING_COLUMN
- **Description**: Column 'lead_time' expected by application but missing from database

### HIGH: quotes.payment_terms
- **Type**: MISSING_COLUMN
- **Description**: Column 'payment_terms' expected by application but missing from database

### HIGH: quotes.delivery_terms
- **Type**: MISSING_COLUMN
- **Description**: Column 'delivery_terms' expected by application but missing from database

### HIGH: quotes.warranty_terms
- **Type**: MISSING_COLUMN
- **Description**: Column 'warranty_terms' expected by application but missing from database

### HIGH: quotes.validity_period
- **Type**: MISSING_COLUMN
- **Description**: Column 'validity_period' expected by application but missing from database

### HIGH: quotes.notes
- **Type**: MISSING_COLUMN
- **Description**: Column 'notes' expected by application but missing from database

### HIGH: quotes.terms
- **Type**: MISSING_COLUMN
- **Description**: Column 'terms' expected by application but missing from database

### HIGH: quotes.conditions
- **Type**: MISSING_COLUMN
- **Description**: Column 'conditions' expected by application but missing from database

### HIGH: quotes.evaluation_score
- **Type**: MISSING_COLUMN
- **Description**: Column 'evaluation_score' expected by application but missing from database

### HIGH: quotes.technical_score
- **Type**: MISSING_COLUMN
- **Description**: Column 'technical_score' expected by application but missing from database

### HIGH: quotes.commercial_score
- **Type**: MISSING_COLUMN
- **Description**: Column 'commercial_score' expected by application but missing from database

### HIGH: quotes.evaluation_notes
- **Type**: MISSING_COLUMN
- **Description**: Column 'evaluation_notes' expected by application but missing from database

### HIGH: quotes.is_winner
- **Type**: MISSING_COLUMN
- **Description**: Column 'is_winner' expected by application but missing from database

### HIGH: quotes.awarded_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'awarded_at' expected by application but missing from database

### HIGH: quotes.rejected_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'rejected_at' expected by application but missing from database

### HIGH: quotes.rejection_reason
- **Type**: MISSING_COLUMN
- **Description**: Column 'rejection_reason' expected by application but missing from database

### HIGH: quotes.created_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'created_at' expected by application but missing from database

### HIGH: quotes.updated_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'updated_at' expected by application but missing from database

### HIGH: quote_items.id
- **Type**: MISSING_COLUMN
- **Description**: Column 'id' expected by application but missing from database

### HIGH: quote_items.quote_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'quote_id' expected by application but missing from database

### HIGH: quote_items.rfq_item_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'rfq_item_id' expected by application but missing from database

### HIGH: quote_items.project_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'project_id' expected by application but missing from database

### HIGH: quote_items.line_number
- **Type**: MISSING_COLUMN
- **Description**: Column 'line_number' expected by application but missing from database

### HIGH: quote_items.item_code
- **Type**: MISSING_COLUMN
- **Description**: Column 'item_code' expected by application but missing from database

### HIGH: quote_items.description
- **Type**: MISSING_COLUMN
- **Description**: Column 'description' expected by application but missing from database

### HIGH: quote_items.quoted_quantity
- **Type**: MISSING_COLUMN
- **Description**: Column 'quoted_quantity' expected by application but missing from database

### HIGH: quote_items.unit_price
- **Type**: MISSING_COLUMN
- **Description**: Column 'unit_price' expected by application but missing from database

### HIGH: quote_items.total_price
- **Type**: MISSING_COLUMN
- **Description**: Column 'total_price' expected by application but missing from database

### HIGH: quote_items.discount_percentage
- **Type**: MISSING_COLUMN
- **Description**: Column 'discount_percentage' expected by application but missing from database

### HIGH: quote_items.discount_amount
- **Type**: MISSING_COLUMN
- **Description**: Column 'discount_amount' expected by application but missing from database

### HIGH: quote_items.alternate_offered
- **Type**: MISSING_COLUMN
- **Description**: Column 'alternate_offered' expected by application but missing from database

### HIGH: quote_items.alternate_description
- **Type**: MISSING_COLUMN
- **Description**: Column 'alternate_description' expected by application but missing from database

### HIGH: quote_items.alternate_part_number
- **Type**: MISSING_COLUMN
- **Description**: Column 'alternate_part_number' expected by application but missing from database

### HIGH: quote_items.alternate_unit_price
- **Type**: MISSING_COLUMN
- **Description**: Column 'alternate_unit_price' expected by application but missing from database

### HIGH: quote_items.lead_time
- **Type**: MISSING_COLUMN
- **Description**: Column 'lead_time' expected by application but missing from database

### HIGH: quote_items.minimum_order_quantity
- **Type**: MISSING_COLUMN
- **Description**: Column 'minimum_order_quantity' expected by application but missing from database

### HIGH: quote_items.packaging_unit
- **Type**: MISSING_COLUMN
- **Description**: Column 'packaging_unit' expected by application but missing from database

### HIGH: quote_items.manufacturer_name
- **Type**: MISSING_COLUMN
- **Description**: Column 'manufacturer_name' expected by application but missing from database

### HIGH: quote_items.part_number
- **Type**: MISSING_COLUMN
- **Description**: Column 'part_number' expected by application but missing from database

### HIGH: quote_items.model_number
- **Type**: MISSING_COLUMN
- **Description**: Column 'model_number' expected by application but missing from database

### HIGH: quote_items.technical_notes
- **Type**: MISSING_COLUMN
- **Description**: Column 'technical_notes' expected by application but missing from database

### HIGH: quote_items.compliance_certificates
- **Type**: MISSING_COLUMN
- **Description**: Column 'compliance_certificates' expected by application but missing from database

### HIGH: quote_items.technical_compliance
- **Type**: MISSING_COLUMN
- **Description**: Column 'technical_compliance' expected by application but missing from database

### HIGH: quote_items.commercial_score
- **Type**: MISSING_COLUMN
- **Description**: Column 'commercial_score' expected by application but missing from database

### HIGH: quote_items.technical_score
- **Type**: MISSING_COLUMN
- **Description**: Column 'technical_score' expected by application but missing from database

### HIGH: quote_items.created_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'created_at' expected by application but missing from database

### HIGH: quote_items.updated_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'updated_at' expected by application but missing from database

### HIGH: quote_documents.id
- **Type**: MISSING_COLUMN
- **Description**: Column 'id' expected by application but missing from database

### HIGH: quote_documents.quote_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'quote_id' expected by application but missing from database

### HIGH: quote_documents.project_id
- **Type**: MISSING_COLUMN
- **Description**: Column 'project_id' expected by application but missing from database

### HIGH: quote_documents.file_name
- **Type**: MISSING_COLUMN
- **Description**: Column 'file_name' expected by application but missing from database

### HIGH: quote_documents.original_name
- **Type**: MISSING_COLUMN
- **Description**: Column 'original_name' expected by application but missing from database

### HIGH: quote_documents.file_size
- **Type**: MISSING_COLUMN
- **Description**: Column 'file_size' expected by application but missing from database

### HIGH: quote_documents.file_type
- **Type**: MISSING_COLUMN
- **Description**: Column 'file_type' expected by application but missing from database

### HIGH: quote_documents.document_type
- **Type**: MISSING_COLUMN
- **Description**: Column 'document_type' expected by application but missing from database

### HIGH: quote_documents.file_url
- **Type**: MISSING_COLUMN
- **Description**: Column 'file_url' expected by application but missing from database

### HIGH: quote_documents.file_path
- **Type**: MISSING_COLUMN
- **Description**: Column 'file_path' expected by application but missing from database

### HIGH: quote_documents.storage_provider
- **Type**: MISSING_COLUMN
- **Description**: Column 'storage_provider' expected by application but missing from database

### HIGH: quote_documents.uploaded_by
- **Type**: MISSING_COLUMN
- **Description**: Column 'uploaded_by' expected by application but missing from database

### HIGH: quote_documents.description
- **Type**: MISSING_COLUMN
- **Description**: Column 'description' expected by application but missing from database

### HIGH: quote_documents.is_public
- **Type**: MISSING_COLUMN
- **Description**: Column 'is_public' expected by application but missing from database

### HIGH: quote_documents.created_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'created_at' expected by application but missing from database

### HIGH: quote_documents.updated_at
- **Type**: MISSING_COLUMN
- **Description**: Column 'updated_at' expected by application but missing from database


## Next Steps
1. Run migration scripts to add missing columns
2. Update application code to handle extra columns
3. Verify all functionality after schema updates
4. Add validation to prevent future schema drift
