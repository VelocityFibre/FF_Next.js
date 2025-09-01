import { sql } from './index.js';

// Get stock positions with pagination and filters
export async function getStockPositions(req, res, projectId) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      category,
      stockStatus,
      warehouseLocation,
      binLocation,
      itemCode,
      lowStock
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [`project_id = ${projectId}::uuid`];
    
    if (category) {
      whereConditions.push(`category = ${category}`);
    }
    if (stockStatus) {
      whereConditions.push(`stock_status = ${stockStatus}`);
    }
    if (warehouseLocation) {
      whereConditions.push(`warehouse_location = ${warehouseLocation}`);
    }
    if (binLocation) {
      whereConditions.push(`bin_location = ${binLocation}`);
    }
    if (itemCode) {
      whereConditions.push(`item_code ILIKE ${'%' + itemCode + '%'}`);
    }
    if (lowStock === 'true') {
      whereConditions.push(`available_quantity <= reorder_point`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM stock_positions
      ${whereClause}
    `;

    // Get paginated results
    const positions = await sql`
      SELECT * FROM stock_positions
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.status(200).json({
      success: true,
      data: {
        positions,
        total: parseInt(countResult[0].total),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock positions:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get single stock position
export async function getStockPosition(req, res, projectId, positionId) {
  try {
    const position = await sql`
      SELECT * FROM stock_positions
      WHERE id = ${positionId}::uuid
      AND project_id = ${projectId}::uuid
    `;

    if (position.length === 0) {
      return res.status(404).json({ success: false, error: 'Stock position not found' });
    }

    res.status(200).json({
      success: true,
      data: position[0]
    });
  } catch (error) {
    console.error('Error fetching stock position:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create stock position
export async function createStockPosition(req, res, projectId) {
  try {
    const positionData = req.body;
    
    const result = await sql`
      INSERT INTO stock_positions (
        project_id, item_code, item_name, item_description, category,
        unit_of_measure, available_quantity, reserved_quantity, 
        total_quantity, reorder_point, reorder_quantity,
        unit_cost, total_value, warehouse_location, bin_location,
        stock_status, last_movement_date, last_count_date,
        supplier_id, manufacturer, part_number, barcode,
        lead_time_days, minimum_order_quantity, maximum_stock_level,
        hazmat_info, storage_conditions, notes
      )
      VALUES (
        ${projectId}::uuid, ${positionData.itemCode}, ${positionData.itemName}, 
        ${positionData.itemDescription}, ${positionData.category},
        ${positionData.unitOfMeasure}, ${positionData.availableQuantity || 0}, 
        ${positionData.reservedQuantity || 0}, ${positionData.totalQuantity || 0}, 
        ${positionData.reorderPoint}, ${positionData.reorderQuantity},
        ${positionData.unitCost || 0}, ${positionData.totalValue || 0}, 
        ${positionData.warehouseLocation}, ${positionData.binLocation},
        ${positionData.stockStatus || 'in_stock'}, ${positionData.lastMovementDate}, 
        ${positionData.lastCountDate}, ${positionData.supplierId}, 
        ${positionData.manufacturer}, ${positionData.partNumber}, 
        ${positionData.barcode}, ${positionData.leadTimeDays}, 
        ${positionData.minimumOrderQuantity}, ${positionData.maximumStockLevel},
        ${JSON.stringify(positionData.hazmatInfo || {})}, 
        ${JSON.stringify(positionData.storageConditions || {})}, 
        ${positionData.notes}
      )
      RETURNING *
    `;

    res.status(201).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error creating stock position:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Update stock position
export async function updateStockPosition(req, res, projectId, positionId) {
  try {
    const updateData = req.body;
    
    // Build dynamic update query
    const updateFields = [];
    const values = [];
    let valueIndex = 1;

    Object.keys(updateData).forEach(key => {
      if (key !== 'id' && key !== 'projectId' && key !== 'createdAt') {
        const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
        updateFields.push(`${snakeKey} = $${valueIndex}`);
        values.push(updateData[key]);
        valueIndex++;
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({ success: false, error: 'No fields to update' });
    }

    updateFields.push(`updated_at = NOW()`);

    const result = await sql`
      UPDATE stock_positions
      SET ${updateFields.join(', ')}
      WHERE id = ${positionId}::uuid
      AND project_id = ${projectId}::uuid
      RETURNING *
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Stock position not found' });
    }

    res.status(200).json({
      success: true,
      data: result[0]
    });
  } catch (error) {
    console.error('Error updating stock position:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Delete stock position
export async function deleteStockPosition(req, res, projectId, positionId) {
  try {
    const result = await sql`
      DELETE FROM stock_positions
      WHERE id = ${positionId}::uuid
      AND project_id = ${projectId}::uuid
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({ success: false, error: 'Stock position not found' });
    }

    res.status(200).json({
      success: true,
      message: 'Stock position deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting stock position:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get stock movements
export async function getStockMovements(req, res, projectId) {
  try {
    const { 
      page = 1, 
      limit = 20, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      movementType,
      status,
      fromDate,
      toDate,
      referenceNumber
    } = req.query;

    const offset = (page - 1) * limit;

    // Build where conditions
    let whereConditions = [`project_id = ${projectId}::uuid`];
    
    if (movementType) {
      whereConditions.push(`movement_type = ${movementType}`);
    }
    if (status) {
      whereConditions.push(`status = ${status}`);
    }
    if (fromDate) {
      whereConditions.push(`created_at >= ${fromDate}`);
    }
    if (toDate) {
      whereConditions.push(`created_at <= ${toDate}`);
    }
    if (referenceNumber) {
      whereConditions.push(`reference_number ILIKE ${'%' + referenceNumber + '%'}`);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await sql`
      SELECT COUNT(*) as total
      FROM stock_movements
      ${whereClause}
    `;

    // Get paginated results with items
    const movements = await sql`
      SELECT 
        sm.*,
        COALESCE(
          json_agg(
            json_build_object(
              'id', smi.id,
              'itemCode', smi.item_code,
              'itemName', smi.item_name,
              'plannedQuantity', smi.planned_quantity,
              'actualQuantity', smi.actual_quantity,
              'unitCost', smi.unit_cost,
              'totalCost', smi.total_cost,
              'status', smi.status
            )
          ) FILTER (WHERE smi.id IS NOT NULL), 
          '[]'
        ) as items
      FROM stock_movements sm
      LEFT JOIN stock_movement_items smi ON sm.id = smi.movement_id
      ${whereClause}
      GROUP BY sm.id
      ORDER BY sm.${sortBy} ${sortOrder}
      LIMIT ${limit}
      OFFSET ${offset}
    `;

    res.status(200).json({
      success: true,
      data: {
        movements,
        total: parseInt(countResult[0].total),
        page: parseInt(page),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching stock movements:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Create stock movement
export async function createStockMovement(req, res, projectId) {
  try {
    const movementData = req.body;
    
    // Start transaction
    await sql`BEGIN`;

    try {
      // Create movement
      const movement = await sql`
        INSERT INTO stock_movements (
          project_id, movement_type, reference_number, reference_type,
          reference_id, from_location, to_location, from_project_id,
          to_project_id, status, movement_date, created_by, notes,
          reason, approved_by, approval_date
        )
        VALUES (
          ${projectId}::uuid, ${movementData.movementType}, 
          ${movementData.referenceNumber}, ${movementData.referenceType},
          ${movementData.referenceId}, ${movementData.fromLocation}, 
          ${movementData.toLocation}, ${movementData.fromProjectId}::uuid,
          ${movementData.toProjectId}::uuid, ${movementData.status || 'pending'}, 
          ${movementData.movementDate || new Date()}, ${movementData.createdBy}, 
          ${movementData.notes}, ${movementData.reason}, 
          ${movementData.approvedBy}, ${movementData.approvalDate}
        )
        RETURNING *
      `;

      // Create movement items if provided
      if (movementData.items && movementData.items.length > 0) {
        for (const item of movementData.items) {
          await sql`
            INSERT INTO stock_movement_items (
              movement_id, item_code, item_name, planned_quantity,
              actual_quantity, unit_cost, total_cost, status,
              lot_number, serial_numbers, expiry_date, notes
            )
            VALUES (
              ${movement[0].id}::uuid, ${item.itemCode}, ${item.itemName},
              ${item.plannedQuantity}, ${item.actualQuantity || item.plannedQuantity},
              ${item.unitCost || 0}, ${item.totalCost || 0}, 
              ${item.status || 'pending'}, ${item.lotNumber},
              ${JSON.stringify(item.serialNumbers || [])}, 
              ${item.expiryDate}, ${item.notes}
            )
          `;
        }
      }

      await sql`COMMIT`;

      res.status(201).json({
        success: true,
        data: movement[0]
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Error creating stock movement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Process bulk movement
export async function processBulkMovement(req, res, projectId) {
  try {
    const bulkData = req.body;
    
    // Start transaction
    await sql`BEGIN`;

    try {
      // Create movement
      const movement = await sql`
        INSERT INTO stock_movements (
          project_id, movement_type, reference_number, reference_type,
          reference_id, from_location, to_location, from_project_id,
          to_project_id, status, notes, reason, created_by
        )
        VALUES (
          ${projectId}::uuid, ${bulkData.movementType}, 
          ${bulkData.referenceNumber}, ${bulkData.referenceType},
          ${bulkData.referenceId}, ${bulkData.fromLocation}, 
          ${bulkData.toLocation}, ${bulkData.fromProjectId}::uuid,
          ${bulkData.toProjectId}::uuid, 'pending', 
          ${bulkData.notes}, ${bulkData.reason}, ${bulkData.userId}
        )
        RETURNING *
      `;

      const movementId = movement[0].id;
      const items = [];

      // Process each item
      for (const item of bulkData.items) {
        // Check stock availability
        const stockCheck = await sql`
          SELECT available_quantity, unit_cost
          FROM stock_positions
          WHERE item_code = ${item.itemCode}
          AND project_id = ${projectId}::uuid
        `;

        if (stockCheck.length === 0) {
          await sql`ROLLBACK`;
          return res.status(400).json({ 
            success: false, 
            error: `Item ${item.itemCode} not found in stock` 
          });
        }

        if (bulkData.movementType === 'outbound' && 
            stockCheck[0].available_quantity < item.plannedQuantity) {
          await sql`ROLLBACK`;
          return res.status(400).json({ 
            success: false, 
            error: `Insufficient stock for item ${item.itemCode}` 
          });
        }

        // Create movement item
        const movementItem = await sql`
          INSERT INTO stock_movement_items (
            movement_id, item_code, item_name, planned_quantity,
            actual_quantity, unit_cost, total_cost, status,
            lot_number, serial_numbers
          )
          VALUES (
            ${movementId}::uuid, ${item.itemCode}, ${item.itemName || item.itemCode},
            ${item.plannedQuantity}, ${item.plannedQuantity},
            ${item.unitCost || stockCheck[0].unit_cost || 0}, 
            ${(item.plannedQuantity * (item.unitCost || stockCheck[0].unit_cost || 0))}, 
            'pending', ${item.lotNumbers?.[0]},
            ${JSON.stringify(item.serialNumbers || [])}
          )
          RETURNING *
        `;

        items.push(movementItem[0]);

        // Update stock positions based on movement type
        if (bulkData.movementType === 'outbound') {
          await sql`
            UPDATE stock_positions
            SET available_quantity = available_quantity - ${item.plannedQuantity},
                reserved_quantity = reserved_quantity + ${item.plannedQuantity},
                last_movement_date = NOW(),
                updated_at = NOW()
            WHERE item_code = ${item.itemCode}
            AND project_id = ${projectId}::uuid
          `;
        } else if (bulkData.movementType === 'inbound') {
          await sql`
            UPDATE stock_positions
            SET available_quantity = available_quantity + ${item.plannedQuantity},
                total_quantity = total_quantity + ${item.plannedQuantity},
                last_movement_date = NOW(),
                updated_at = NOW()
            WHERE item_code = ${item.itemCode}
            AND project_id = ${projectId}::uuid
          `;
        }
      }

      await sql`COMMIT`;

      res.status(201).json({
        success: true,
        data: {
          movement: movement[0],
          items
        }
      });
    } catch (error) {
      await sql`ROLLBACK`;
      throw error;
    }
  } catch (error) {
    console.error('Error processing bulk movement:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Get stock dashboard data
export async function getStockDashboard(req, res, projectId) {
  try {
    // Get summary statistics
    const stats = await sql`
      SELECT
        COUNT(DISTINCT id) as total_items,
        SUM(total_value) as total_value,
        SUM(CASE WHEN available_quantity <= reorder_point THEN 1 ELSE 0 END) as low_stock_items,
        SUM(CASE WHEN available_quantity = 0 THEN 1 ELSE 0 END) as out_of_stock_items
      FROM stock_positions
      WHERE project_id = ${projectId}::uuid
    `;

    // Get recent movements
    const recentMovements = await sql`
      SELECT 
        sm.*,
        COALESCE(
          json_agg(
            json_build_object(
              'itemCode', smi.item_code,
              'itemName', smi.item_name,
              'quantity', smi.actual_quantity
            )
          ) FILTER (WHERE smi.id IS NOT NULL), 
          '[]'
        ) as items
      FROM stock_movements sm
      LEFT JOIN stock_movement_items smi ON sm.id = smi.movement_id
      WHERE sm.project_id = ${projectId}::uuid
      GROUP BY sm.id
      ORDER BY sm.created_at DESC
      LIMIT 10
    `;

    // Get top categories
    const topCategories = await sql`
      SELECT 
        category,
        COUNT(*) as item_count,
        SUM(total_value) as total_value
      FROM stock_positions
      WHERE project_id = ${projectId}::uuid
      GROUP BY category
      ORDER BY total_value DESC
      LIMIT 5
    `;

    // Get stock levels distribution
    const stockLevels = await sql`
      SELECT 
        stock_status as status,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / NULLIF(SUM(COUNT(*)) OVER(), 0), 2) as percentage
      FROM stock_positions
      WHERE project_id = ${projectId}::uuid
      GROUP BY stock_status
    `;

    res.status(200).json({
      success: true,
      data: {
        totalItems: parseInt(stats[0].total_items || 0),
        totalValue: parseFloat(stats[0].total_value || 0),
        lowStockItems: parseInt(stats[0].low_stock_items || 0),
        criticalStockItems: parseInt(stats[0].out_of_stock_items || 0),
        recentMovements,
        topCategories,
        stockLevels
      }
    });
  } catch (error) {
    console.error('Error fetching stock dashboard:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}