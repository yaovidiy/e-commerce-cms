import { form, query } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { UpdateProfileSchema } from '$lib/server/schemas';
import { getUser } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

/**
 * Get current user's profile
 */
export const getMyProfile = query(async () => {
    const sessionUser = getUser();
    
    // Fetch full user data from database
    const [user] = await db
        .select()
        .from(tables.user)
        .where(eq(tables.user.id, sessionUser.id));
    
    if (!user) {
        error(404, 'User not found');
    }
    
    return {
        id: user.id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        marketingOptIn: user.marketingOptIn,
        role: user.role,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
    };
});

/**
 * Update current user's profile
 */
export const updateProfile = form(UpdateProfileSchema, async (data) => {
    const user = getUser();
    
    // Filter out undefined values
    const updateData: Partial<typeof data> = {};
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.marketingOptIn !== undefined) updateData.marketingOptIn = data.marketingOptIn;
    
    // Update user profile
    const [updatedUser] = await db
        .update(tables.user)
        .set(updateData)
        .where(eq(tables.user.id, user.id))
        .returning();
    
    // Refresh the profile query
    await getMyProfile().refresh();
    
    return {
        success: true,
        user: updatedUser
    };
});
