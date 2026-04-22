import { supabaseAdmin } from './supabaseAdmin';

/**
 * Logs a system activity to the activity_logs table.
 * 
 * @param userId The ID of the user performing the action.
 * @param actionType The type of action (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN').
 * @param module The module where the action occurred (e.g., 'User Management').
 * @param description A human-readable description of the action.
 * @param status 'Success' or 'Failed'.
 */
export async function logActivity(
	userId: number | null,
	actionType: string,
	module: string,
	description: string,
	status: 'Success' | 'Failed' = 'Success'
) {
	try {
		const { error } = await supabaseAdmin.from('activity_logs').insert({
			user_id: userId,
			action_type: actionType,
			module: module,
			description: description,
			status: status,
		});

		if (error) {
			console.error('[Activity Log] Supabase Error:', error.message);
		}
	} catch (err) {
		console.error('[Activity Log] Unexpected Error:', err);
	}
}
