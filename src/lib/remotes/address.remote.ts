import { form, query, command } from '$app/server';
import { db } from '$lib/server/db';
import * as tables from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import {
    CreateAddressSchema,
    UpdateAddressSchema,
    DeleteAddressSchema,
    SetDefaultAddressSchema
} from '$lib/server/schemas';
import { getUser } from '$lib/server/auth';
import { error } from '@sveltejs/kit';

/**
 * Get all addresses for current user
 */
export const getMyAddresses = query(async () => {
    const user = getUser();
    
    const addresses = await db
        .select()
        .from(tables.address)
        .where(eq(tables.address.userId, user.id))
        .orderBy(tables.address.isDefault);
    
    return addresses;
});

/**
 * Create new address for current user
 */
export const createAddress = form(CreateAddressSchema, async (data) => {
    const user = getUser();
    
    // If this is the first address or marked as default, unset other defaults
    if (data.isDefault) {
        await db
            .update(tables.address)
            .set({ isDefault: false })
            .where(eq(tables.address.userId, user.id));
    } else {
        // If user has no addresses, make this the default
        const existingAddresses = await db
            .select()
            .from(tables.address)
            .where(eq(tables.address.userId, user.id));
        
        if (existingAddresses.length === 0) {
            data.isDefault = true;
        }
    }
    
    const [newAddress] = await db
        .insert(tables.address)
        .values({
            id: crypto.randomUUID(),
            userId: user.id,
            firstName: data.firstName,
            lastName: data.lastName,
            company: data.company,
            address1: data.address1,
            address2: data.address2,
            city: data.city,
            state: data.state,
            postalCode: data.postalCode,
            country: data.country,
            phone: data.phone,
            isDefault: data.isDefault || false,
            createdAt: new Date(),
            updatedAt: new Date()
        })
        .returning();
    
    // Refresh addresses list
    await getMyAddresses().refresh();
    
    return {
        success: true,
        address: newAddress
    };
});

/**
 * Update existing address
 */
export const updateAddress = form(UpdateAddressSchema, async (data) => {
    const user = getUser();
    
    // Verify address belongs to user
    const [existingAddress] = await db
        .select()
        .from(tables.address)
        .where(
            and(
                eq(tables.address.id, data.id),
                eq(tables.address.userId, user.id)
            )
        );
    
    if (!existingAddress) {
        error(404, 'Address not found');
    }
    
    // If setting as default, unset other defaults
    if (data.isDefault) {
        await db
            .update(tables.address)
            .set({ isDefault: false })
            .where(
                and(
                    eq(tables.address.userId, user.id),
                    eq(tables.address.id, data.id)
                )
            );
    }
    
    // Filter out undefined values
    const updateData: Partial<typeof data> & { updatedAt: Date } = { updatedAt: new Date() };
    if (data.firstName !== undefined) updateData.firstName = data.firstName;
    if (data.lastName !== undefined) updateData.lastName = data.lastName;
    if (data.company !== undefined) updateData.company = data.company;
    if (data.address1 !== undefined) updateData.address1 = data.address1;
    if (data.address2 !== undefined) updateData.address2 = data.address2;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
    if (data.country !== undefined) updateData.country = data.country;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    
    const [updatedAddress] = await db
        .update(tables.address)
        .set(updateData)
        .where(eq(tables.address.id, data.id))
        .returning();
    
    // Refresh addresses list
    await getMyAddresses().refresh();
    
    return {
        success: true,
        address: updatedAddress
    };
});

/**
 * Delete address
 */
export const deleteAddress = form(DeleteAddressSchema, async (data) => {
    const user = getUser();
    
    // Verify address belongs to user
    const [existingAddress] = await db
        .select()
        .from(tables.address)
        .where(
            and(
                eq(tables.address.id, data.id),
                eq(tables.address.userId, user.id)
            )
        );
    
    if (!existingAddress) {
        error(404, 'Address not found');
    }
    
    // Delete the address
    await db
        .delete(tables.address)
        .where(eq(tables.address.id, data.id));
    
    // If this was the default address, set another as default
    if (existingAddress.isDefault) {
        const [nextAddress] = await db
            .select()
            .from(tables.address)
            .where(eq(tables.address.userId, user.id))
            .limit(1);
        
        if (nextAddress) {
            await db
                .update(tables.address)
                .set({ isDefault: true })
                .where(eq(tables.address.id, nextAddress.id));
        }
    }
    
    // Refresh addresses list
    await getMyAddresses().refresh();
    
    return {
        success: true
    };
});

/**
 * Set address as default
 */
export const setDefaultAddress = command(SetDefaultAddressSchema, async (data) => {
    const user = getUser();
    
    // Verify address belongs to user
    const [existingAddress] = await db
        .select()
        .from(tables.address)
        .where(
            and(
                eq(tables.address.id, data.id),
                eq(tables.address.userId, user.id)
            )
        );
    
    if (!existingAddress) {
        error(404, 'Address not found');
    }
    
    // Unset all defaults for this user
    await db
        .update(tables.address)
        .set({ isDefault: false })
        .where(eq(tables.address.userId, user.id));
    
    // Set this address as default
    await db
        .update(tables.address)
        .set({ isDefault: true, updatedAt: new Date() })
        .where(eq(tables.address.id, data.id));
    
    // Refresh addresses list
    await getMyAddresses().refresh();
    
    return {
        success: true
    };
});
