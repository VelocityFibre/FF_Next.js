import { relations } from "drizzle-orm/relations";
import { contractors, contractorTeams, teamMembers, projectAssignments, contractorDocuments, boqs, boqItems, boqExceptions, purchaseRequisitions, requisitionItems, purchaseOrders, poItems, clients, projects, staff } from "./schema";

export const contractorTeamsRelations = relations(contractorTeams, ({one, many}) => ({
	contractor: one(contractors, {
		fields: [contractorTeams.contractorId],
		references: [contractors.id]
	}),
	teamMembers: many(teamMembers),
	projectAssignments: many(projectAssignments),
}));

export const contractorsRelations = relations(contractors, ({many}) => ({
	contractorTeams: many(contractorTeams),
	teamMembers: many(teamMembers),
	projectAssignments: many(projectAssignments),
	contractorDocuments: many(contractorDocuments),
}));

export const teamMembersRelations = relations(teamMembers, ({one}) => ({
	contractorTeam: one(contractorTeams, {
		fields: [teamMembers.teamId],
		references: [contractorTeams.id]
	}),
	contractor: one(contractors, {
		fields: [teamMembers.contractorId],
		references: [contractors.id]
	}),
}));

export const projectAssignmentsRelations = relations(projectAssignments, ({one}) => ({
	contractor: one(contractors, {
		fields: [projectAssignments.contractorId],
		references: [contractors.id]
	}),
	contractorTeam: one(contractorTeams, {
		fields: [projectAssignments.teamId],
		references: [contractorTeams.id]
	}),
}));

export const contractorDocumentsRelations = relations(contractorDocuments, ({one}) => ({
	contractor: one(contractors, {
		fields: [contractorDocuments.contractorId],
		references: [contractors.id]
	}),
}));

export const boqItemsRelations = relations(boqItems, ({one, many}) => ({
	boq: one(boqs, {
		fields: [boqItems.boqId],
		references: [boqs.id]
	}),
	boqExceptions: many(boqExceptions),
	requisitionItems: many(requisitionItems),
}));

export const boqsRelations = relations(boqs, ({many}) => ({
	boqItems: many(boqItems),
	boqExceptions: many(boqExceptions),
	purchaseRequisitions: many(purchaseRequisitions),
}));

export const boqExceptionsRelations = relations(boqExceptions, ({one}) => ({
	boq: one(boqs, {
		fields: [boqExceptions.boqId],
		references: [boqs.id]
	}),
	boqItem: one(boqItems, {
		fields: [boqExceptions.boqItemId],
		references: [boqItems.id]
	}),
}));

export const requisitionItemsRelations = relations(requisitionItems, ({one, many}) => ({
	purchaseRequisition: one(purchaseRequisitions, {
		fields: [requisitionItems.prId],
		references: [purchaseRequisitions.id]
	}),
	boqItem: one(boqItems, {
		fields: [requisitionItems.boqItemId],
		references: [boqItems.id]
	}),
	poItems: many(poItems),
}));

export const purchaseRequisitionsRelations = relations(purchaseRequisitions, ({one, many}) => ({
	requisitionItems: many(requisitionItems),
	boq: one(boqs, {
		fields: [purchaseRequisitions.boqId],
		references: [boqs.id]
	}),
	purchaseOrders: many(purchaseOrders),
}));

export const purchaseOrdersRelations = relations(purchaseOrders, ({one, many}) => ({
	purchaseRequisition: one(purchaseRequisitions, {
		fields: [purchaseOrders.prId],
		references: [purchaseRequisitions.id]
	}),
	poItems: many(poItems),
}));

export const poItemsRelations = relations(poItems, ({one}) => ({
	purchaseOrder: one(purchaseOrders, {
		fields: [poItems.poId],
		references: [purchaseOrders.id]
	}),
	requisitionItem: one(requisitionItems, {
		fields: [poItems.prItemId],
		references: [requisitionItems.id]
	}),
}));

export const projectsRelations = relations(projects, ({one}) => ({
	client: one(clients, {
		fields: [projects.clientId],
		references: [clients.id]
	}),
	staff: one(staff, {
		fields: [projects.projectManagerId],
		references: [staff.id]
	}),
}));

export const clientsRelations = relations(clients, ({many}) => ({
	projects: many(projects),
}));

export const staffRelations = relations(staff, ({one, many}) => ({
	projects: many(projects),
	staff_reportsTo: one(staff, {
		fields: [staff.reportsTo],
		references: [staff.id],
		relationName: "staff_reportsTo_staff_id"
	}),
	staff_reportsTo: many(staff, {
		relationName: "staff_reportsTo_staff_id"
	}),
}));