import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Extract the resource and action from the URL path
    const { resource, action, id } = req.query;

    // Route to appropriate handler based on resource
    switch (resource) {
      case 'stock':
        return await handleStockRequests(req, res, action, id);
      case 'purchase-orders':
        return await handlePurchaseOrderRequests(req, res, action, id);
      case 'rfq':
        return await handleRFQRequests(req, res, action, id);
      case 'boq':
        return await handleBOQRequests(req, res, action, id);
      case 'cable-drums':
        return await handleCableDrumRequests(req, res, action, id);
      case 'health':
        return await handleHealthCheck(req, res);
      default:
        return res.status(400).json({ success: false, error: 'Invalid resource type' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

// Health check endpoint
async function handleHealthCheck(req, res) {
  try {
    await sql`SELECT 1`;
    res.status(200).json({ 
      success: true, 
      status: 'healthy',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      status: 'unhealthy',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Stock management handlers
async function handleStockRequests(req, res, action, id) {
  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  switch (req.method) {
    case 'GET':
      if (id) {
        // GET /api/procurement?resource=stock&id=xxx - Get specific stock position
        return await getStockPosition(req, res, projectId, id);
      } else if (action === 'movements') {
        // GET /api/procurement?resource=stock&action=movements - Get stock movements
        return await getStockMovements(req, res, projectId);
      } else if (action === 'dashboard') {
        // GET /api/procurement?resource=stock&action=dashboard - Get dashboard data
        return await getStockDashboard(req, res, projectId);
      } else {
        // GET /api/procurement?resource=stock - List stock positions
        return await getStockPositions(req, res, projectId);
      }

    case 'POST':
      if (action === 'movement') {
        // POST /api/procurement?resource=stock&action=movement - Create stock movement
        return await createStockMovement(req, res, projectId);
      } else if (action === 'bulk-movement') {
        // POST /api/procurement?resource=stock&action=bulk-movement - Bulk movement
        return await processBulkMovement(req, res, projectId);
      } else {
        // POST /api/procurement?resource=stock - Create stock position
        return await createStockPosition(req, res, projectId);
      }

    case 'PUT':
      if (!id) {
        return res.status(400).json({ success: false, error: 'Stock ID required for update' });
      }
      // PUT /api/procurement?resource=stock&id=xxx - Update stock position
      return await updateStockPosition(req, res, projectId, id);

    case 'DELETE':
      if (!id) {
        return res.status(400).json({ success: false, error: 'Stock ID required for delete' });
      }
      // DELETE /api/procurement?resource=stock&id=xxx - Delete stock position
      return await deleteStockPosition(req, res, projectId, id);

    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// Purchase Order handlers
async function handlePurchaseOrderRequests(req, res, action, id) {
  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  switch (req.method) {
    case 'GET':
      if (id) {
        // GET /api/procurement?resource=purchase-orders&id=xxx
        return await getPurchaseOrder(req, res, projectId, id);
      } else {
        // GET /api/procurement?resource=purchase-orders
        return await getPurchaseOrders(req, res, projectId);
      }

    case 'POST':
      // POST /api/procurement?resource=purchase-orders
      return await createPurchaseOrder(req, res, projectId);

    case 'PUT':
      if (!id) {
        return res.status(400).json({ success: false, error: 'Purchase Order ID required for update' });
      }
      // PUT /api/procurement?resource=purchase-orders&id=xxx
      return await updatePurchaseOrder(req, res, projectId, id);

    case 'DELETE':
      if (!id) {
        return res.status(400).json({ success: false, error: 'Purchase Order ID required for delete' });
      }
      // DELETE /api/procurement?resource=purchase-orders&id=xxx
      return await deletePurchaseOrder(req, res, projectId, id);

    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// RFQ handlers
async function handleRFQRequests(req, res, action, id) {
  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  switch (req.method) {
    case 'GET':
      if (id) {
        // GET /api/procurement?resource=rfq&id=xxx
        return await getRFQ(req, res, projectId, id);
      } else if (action === 'supplier-history') {
        // GET /api/procurement?resource=rfq&action=supplier-history&supplierId=xxx
        return await getSupplierRFQHistory(req, res, projectId);
      } else {
        // GET /api/procurement?resource=rfq
        return await getRFQs(req, res, projectId);
      }

    case 'POST':
      if (action === 'add-suppliers') {
        // POST /api/procurement?resource=rfq&action=add-suppliers&id=xxx
        return await addSuppliersToRFQ(req, res, projectId, id);
      } else {
        // POST /api/procurement?resource=rfq
        return await createRFQ(req, res, projectId);
      }

    case 'PUT':
      if (!id) {
        return res.status(400).json({ success: false, error: 'RFQ ID required for update' });
      }
      if (action === 'replace-suppliers') {
        // PUT /api/procurement?resource=rfq&action=replace-suppliers&id=xxx
        return await replaceRFQSuppliers(req, res, projectId, id);
      } else {
        // PUT /api/procurement?resource=rfq&id=xxx
        return await updateRFQ(req, res, projectId, id);
      }

    case 'DELETE':
      if (!id) {
        return res.status(400).json({ success: false, error: 'RFQ ID required for delete' });
      }
      if (action === 'remove-suppliers') {
        // DELETE /api/procurement?resource=rfq&action=remove-suppliers&id=xxx
        return await removeSuppliersFromRFQ(req, res, projectId, id);
      } else {
        // DELETE /api/procurement?resource=rfq&id=xxx
        return await deleteRFQ(req, res, projectId, id);
      }

    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// BOQ handlers
async function handleBOQRequests(req, res, action, id) {
  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  switch (req.method) {
    case 'GET':
      if (id) {
        // GET /api/procurement?resource=boq&id=xxx
        return await getBOQ(req, res, projectId, id);
      } else if (action === 'items') {
        // GET /api/procurement?resource=boq&action=items&boqId=xxx
        return await getBOQItems(req, res, projectId);
      } else if (action === 'exceptions') {
        // GET /api/procurement?resource=boq&action=exceptions&boqId=xxx
        return await getBOQExceptions(req, res, projectId);
      } else {
        // GET /api/procurement?resource=boq
        return await getBOQs(req, res, projectId);
      }

    case 'POST':
      if (action === 'import') {
        // POST /api/procurement?resource=boq&action=import
        return await importBOQ(req, res, projectId);
      } else if (action === 'map') {
        // POST /api/procurement?resource=boq&action=map&id=xxx
        return await performBOQMapping(req, res, projectId, id);
      } else if (action === 'resolve-exception') {
        // POST /api/procurement?resource=boq&action=resolve-exception&id=xxx
        return await resolveBOQException(req, res, projectId, id);
      } else {
        // POST /api/procurement?resource=boq
        return await createBOQ(req, res, projectId);
      }

    case 'PUT':
      if (!id) {
        return res.status(400).json({ success: false, error: 'BOQ ID required for update' });
      }
      // PUT /api/procurement?resource=boq&id=xxx
      return await updateBOQ(req, res, projectId, id);

    case 'DELETE':
      if (!id) {
        return res.status(400).json({ success: false, error: 'BOQ ID required for delete' });
      }
      // DELETE /api/procurement?resource=boq&id=xxx
      return await deleteBOQ(req, res, projectId, id);

    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// Cable Drum handlers
async function handleCableDrumRequests(req, res, action, id) {
  const { projectId } = req.query;
  
  if (!projectId) {
    return res.status(400).json({ success: false, error: 'Project ID required' });
  }

  switch (req.method) {
    case 'GET':
      if (id) {
        // GET /api/procurement?resource=cable-drums&id=xxx
        return await getCableDrum(req, res, projectId, id);
      } else {
        // GET /api/procurement?resource=cable-drums
        return await getCableDrums(req, res, projectId);
      }

    case 'POST':
      if (action === 'usage') {
        // POST /api/procurement?resource=cable-drums&action=usage&id=xxx
        return await updateDrumUsage(req, res, projectId, id);
      } else {
        // POST /api/procurement?resource=cable-drums
        return await createCableDrum(req, res, projectId);
      }

    case 'PUT':
      if (!id) {
        return res.status(400).json({ success: false, error: 'Cable Drum ID required for update' });
      }
      // PUT /api/procurement?resource=cable-drums&id=xxx
      return await updateCableDrum(req, res, projectId, id);

    case 'DELETE':
      if (!id) {
        return res.status(400).json({ success: false, error: 'Cable Drum ID required for delete' });
      }
      // DELETE /api/procurement?resource=cable-drums&id=xxx
      return await deleteCableDrum(req, res, projectId, id);

    default:
      return res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}

// Export for use in other files
export { sql };