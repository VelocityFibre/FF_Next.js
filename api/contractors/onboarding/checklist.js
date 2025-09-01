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
    switch (req.method) {
      case 'GET':
        return await handleGetChecklist(req, res);
      case 'PUT':
        return await handleUpdateChecklistItem(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetChecklist(req, res) {
  try {
    const { contractorId, onboardingId } = req.query;

    if (!contractorId && !onboardingId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either contractor ID or onboarding ID required' 
      });
    }

    let query;
    let params;

    if (onboardingId) {
      query = `
        SELECT 
          cl.*,
          co.status as onboarding_status,
          co.current_stage
        FROM contractor_onboarding_checklist cl
        INNER JOIN contractor_onboarding co ON cl.onboarding_id = co.id
        WHERE cl.onboarding_id = $1
        ORDER BY cl.step_order
      `;
      params = [onboardingId];
    } else {
      query = `
        SELECT 
          cl.*,
          co.status as onboarding_status,
          co.current_stage,
          co.id as onboarding_id
        FROM contractor_onboarding_checklist cl
        INNER JOIN contractor_onboarding co ON cl.onboarding_id = co.id
        WHERE co.contractor_id = $1
        ORDER BY cl.step_order
      `;
      params = [contractorId];
    }

    const checklist = await sql(query, params);

    if (checklist.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'No onboarding checklist found' 
      });
    }

    // Calculate progress
    const requiredItems = checklist.filter(item => item.is_required);
    const completedRequired = requiredItems.filter(item => item.is_completed);
    const progress = Math.round((completedRequired.length / requiredItems.length) * 100);

    // Get stage progress
    const stages = {};
    checklist.forEach(item => {
      const stage = item.step_key.split('_')[0]; // Extract stage from step key
      if (!stages[stage]) {
        stages[stage] = { total: 0, completed: 0 };
      }
      stages[stage].total++;
      if (item.is_completed) {
        stages[stage].completed++;
      }
    });

    // Determine next incomplete required step
    const nextStep = checklist.find(item => item.is_required && !item.is_completed);

    return res.status(200).json({ 
      success: true, 
      data: {
        checklist,
        progress,
        stages,
        nextStep,
        onboardingId: checklist[0].onboarding_id,
        onboardingStatus: checklist[0].onboarding_status,
        currentStage: checklist[0].current_stage,
        totalSteps: checklist.length,
        completedSteps: checklist.filter(item => item.is_completed).length,
        requiredSteps: requiredItems.length,
        completedRequiredSteps: completedRequired.length
      }
    });
  } catch (error) {
    console.error('Error fetching checklist:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleUpdateChecklistItem(req, res) {
  try {
    const {
      itemId,
      contractorId,
      stepKey,
      isCompleted,
      completedBy,
      completedAt,
      notes
    } = req.body;

    if (!itemId && (!contractorId || !stepKey)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either item ID or (contractor ID and step key) required' 
      });
    }

    let query;
    let params;

    if (itemId) {
      // Update by item ID
      query = `
        UPDATE contractor_onboarding_checklist
        SET 
          is_completed = $1,
          completed_by = $2,
          completed_at = $3,
          notes = COALESCE($4, notes),
          updated_at = NOW()
        WHERE id = $5
        RETURNING *
      `;
      params = [
        isCompleted,
        isCompleted ? (completedBy || 'system') : null,
        isCompleted ? (completedAt || new Date()) : null,
        notes,
        itemId
      ];
    } else {
      // Update by contractor ID and step key
      const onboarding = await sql`
        SELECT id FROM contractor_onboarding
        WHERE contractor_id = ${contractorId}
        LIMIT 1
      `;

      if (onboarding.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'No onboarding found for this contractor' 
        });
      }

      query = `
        UPDATE contractor_onboarding_checklist
        SET 
          is_completed = $1,
          completed_by = $2,
          completed_at = $3,
          notes = COALESCE($4, notes),
          updated_at = NOW()
        WHERE onboarding_id = $5 AND step_key = $6
        RETURNING *
      `;
      params = [
        isCompleted,
        isCompleted ? (completedBy || 'system') : null,
        isCompleted ? (completedAt || new Date()) : null,
        notes,
        onboarding[0].id,
        stepKey
      ];
    }

    const result = await sql(query, params);

    if (result.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Checklist item not found' 
      });
    }

    const updatedItem = result[0];

    // Log activity
    await sql`
      INSERT INTO contractor_onboarding_activity (
        onboarding_id,
        action,
        details,
        performed_by
      )
      VALUES (
        ${updatedItem.onboarding_id},
        ${isCompleted ? 'Checklist item completed' : 'Checklist item uncompleted'},
        ${JSON.stringify({
          stepKey: updatedItem.step_key,
          stepName: updatedItem.step_name,
          isCompleted
        })},
        ${completedBy || 'system'}
      )
    `;

    // Check if all required items are completed
    const allItems = await sql`
      SELECT 
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE is_completed = true) as completed
      FROM contractor_onboarding_checklist
      WHERE onboarding_id = ${updatedItem.onboarding_id}
      AND is_required = true
    `;

    const allCompleted = allItems[0].total === allItems[0].completed;

    // Update onboarding stage if needed
    if (isCompleted && updatedItem.step_key === 'final_approval' && allCompleted) {
      await sql`
        UPDATE contractor_onboarding
        SET 
          status = 'completed',
          completed_at = NOW(),
          completed_by = ${completedBy || 'system'},
          updated_at = NOW()
        WHERE id = ${updatedItem.onboarding_id}
      `;

      // Update contractor status
      const onboardingData = await sql`
        SELECT contractor_id FROM contractor_onboarding
        WHERE id = ${updatedItem.onboarding_id}
      `;

      if (onboardingData.length > 0) {
        await sql`
          UPDATE contractors
          SET status = 'active', updated_at = NOW()
          WHERE id = ${onboardingData[0].contractor_id}
        `;
      }
    }

    return res.status(200).json({ 
      success: true, 
      data: updatedItem,
      allRequiredCompleted: allCompleted,
      message: `Checklist item ${isCompleted ? 'completed' : 'marked incomplete'}`
    });
  } catch (error) {
    console.error('Error updating checklist item:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}