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
        return await handleGetTeams(req, res);
      case 'POST':
        return await handleAssignTeam(req, res);
      case 'DELETE':
        return await handleRemoveFromTeam(req, res);
      default:
        res.status(405).json({ success: false, error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}

async function handleGetTeams(req, res) {
  try {
    const { contractorId } = req.query;

    if (!contractorId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID required' 
      });
    }

    // Get teams assigned to contractor
    const teams = await sql`
      SELECT 
        t.*,
        ct.assigned_at,
        ct.assigned_by,
        ct.role as contractor_role,
        u.name as assigned_by_name
      FROM teams t
      INNER JOIN contractor_teams ct ON t.id = ct.team_id
      LEFT JOIN users u ON ct.assigned_by = u.id
      WHERE ct.contractor_id = ${contractorId}
      AND ct.is_active = true
      ORDER BY ct.assigned_at DESC
    `;

    // Get available teams (not assigned to this contractor)
    const availableTeams = await sql`
      SELECT t.* 
      FROM teams t
      WHERE t.is_active = true
      AND NOT EXISTS (
        SELECT 1 FROM contractor_teams ct 
        WHERE ct.team_id = t.id 
        AND ct.contractor_id = ${contractorId}
        AND ct.is_active = true
      )
      ORDER BY t.name
    `;

    // Get team members for assigned teams
    const teamIds = teams.map(t => t.id);
    let teamMembers = [];
    
    if (teamIds.length > 0) {
      teamMembers = await sql`
        SELECT 
          tm.team_id,
          tm.user_id,
          tm.role,
          u.name as member_name,
          u.email as member_email
        FROM team_members tm
        INNER JOIN users u ON tm.user_id = u.id
        WHERE tm.team_id = ANY(${teamIds})
        AND tm.is_active = true
        ORDER BY tm.role, u.name
      `;
    }

    // Group members by team
    const membersByTeam = {};
    teamMembers.forEach(member => {
      if (!membersByTeam[member.team_id]) {
        membersByTeam[member.team_id] = [];
      }
      membersByTeam[member.team_id].push(member);
    });

    // Add members to teams
    const teamsWithMembers = teams.map(team => ({
      ...team,
      members: membersByTeam[team.id] || []
    }));

    return res.status(200).json({ 
      success: true, 
      data: {
        assignedTeams: teamsWithMembers,
        availableTeams: availableTeams,
        totalAssignedTeams: teams.length,
        totalAvailableTeams: availableTeams.length
      }
    });
  } catch (error) {
    console.error('Error fetching contractor teams:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleAssignTeam(req, res) {
  try {
    const { contractorId, teamId, role = 'member', assignedBy } = req.body;

    if (!contractorId || !teamId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID and Team ID are required' 
      });
    }

    // Verify contractor exists
    const contractor = await sql`
      SELECT id, company_name FROM contractors 
      WHERE id = ${contractorId}
    `;

    if (contractor.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contractor not found' 
      });
    }

    // Verify team exists
    const team = await sql`
      SELECT id, name FROM teams 
      WHERE id = ${teamId}
    `;

    if (team.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Team not found' 
      });
    }

    // Check if already assigned
    const existing = await sql`
      SELECT id, is_active FROM contractor_teams
      WHERE contractor_id = ${contractorId}
      AND team_id = ${teamId}
    `;

    if (existing.length > 0) {
      if (existing[0].is_active) {
        return res.status(409).json({ 
          success: false, 
          error: 'Contractor is already assigned to this team' 
        });
      } else {
        // Reactivate existing assignment
        const reactivated = await sql`
          UPDATE contractor_teams
          SET 
            is_active = true,
            role = ${role},
            assigned_at = NOW(),
            assigned_by = ${assignedBy || 'system'},
            updated_at = NOW()
          WHERE id = ${existing[0].id}
          RETURNING *
        `;

        return res.status(200).json({ 
          success: true, 
          data: reactivated[0],
          message: 'Contractor re-assigned to team successfully'
        });
      }
    }

    // Create new assignment
    const assignment = await sql`
      INSERT INTO contractor_teams (
        contractor_id,
        team_id,
        role,
        assigned_at,
        assigned_by,
        is_active
      )
      VALUES (
        ${contractorId},
        ${teamId},
        ${role},
        NOW(),
        ${assignedBy || 'system'},
        true
      )
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO team_activity_log (
        team_id,
        action,
        entity_type,
        entity_id,
        details,
        performed_by,
        created_at
      )
      VALUES (
        ${teamId},
        'contractor_assigned',
        'contractor',
        ${contractorId},
        ${JSON.stringify({
          contractorName: contractor[0].company_name,
          role: role
        })},
        ${assignedBy || 'system'},
        NOW()
      )
    `;

    // Get team details for response
    const teamDetails = await sql`
      SELECT 
        t.*,
        ct.assigned_at,
        ct.assigned_by,
        ct.role as contractor_role
      FROM teams t
      INNER JOIN contractor_teams ct ON t.id = ct.team_id
      WHERE ct.id = ${assignment[0].id}
    `;

    return res.status(201).json({ 
      success: true, 
      data: teamDetails[0],
      message: 'Contractor assigned to team successfully'
    });
  } catch (error) {
    console.error('Error assigning contractor to team:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}

async function handleRemoveFromTeam(req, res) {
  try {
    const { contractorId, teamId, removedBy } = req.body;

    if (!contractorId || !teamId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Contractor ID and Team ID are required' 
      });
    }

    // Get assignment details
    const assignment = await sql`
      SELECT 
        ct.*,
        c.company_name,
        t.name as team_name
      FROM contractor_teams ct
      INNER JOIN contractors c ON ct.contractor_id = c.id
      INNER JOIN teams t ON ct.team_id = t.id
      WHERE ct.contractor_id = ${contractorId}
      AND ct.team_id = ${teamId}
      AND ct.is_active = true
    `;

    if (assignment.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Contractor is not assigned to this team' 
      });
    }

    // Soft delete the assignment
    const removed = await sql`
      UPDATE contractor_teams
      SET 
        is_active = false,
        removed_at = NOW(),
        removed_by = ${removedBy || 'system'},
        updated_at = NOW()
      WHERE contractor_id = ${contractorId}
      AND team_id = ${teamId}
      AND is_active = true
      RETURNING *
    `;

    // Log activity
    await sql`
      INSERT INTO team_activity_log (
        team_id,
        action,
        entity_type,
        entity_id,
        details,
        performed_by,
        created_at
      )
      VALUES (
        ${teamId},
        'contractor_removed',
        'contractor',
        ${contractorId},
        ${JSON.stringify({
          contractorName: assignment[0].company_name,
          role: assignment[0].role
        })},
        ${removedBy || 'system'},
        NOW()
      )
    `;

    return res.status(200).json({ 
      success: true, 
      data: {
        contractorId,
        teamId,
        removedAt: removed[0].removed_at
      },
      message: 'Contractor removed from team successfully'
    });
  } catch (error) {
    console.error('Error removing contractor from team:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
}