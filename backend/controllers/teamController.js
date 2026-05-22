/**
 * Team Controller
 * CRUD for team members with optional photo upload to Supabase Storage.
 */

const supabase = require('../config/supabaseClient');
const path = require('path');
const crypto = require('crypto');

const BUCKET = 'team-photos';
const YEAR_ORDER = { faculty: 1, '4th': 2, '3rd': 3, '2nd': 4, '1st': 5 };

/**
 * GET /api/team
 * Return all team members ordered by tier (faculty → 4th → 3rd → 2nd → 1st),
 * then by display_order within each tier.
 */
async function getTeam(req, res) {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  // Sort by year hierarchy
  const sorted = (data || []).sort((a, b) => {
    const oa = YEAR_ORDER[a.year] || 99;
    const ob = YEAR_ORDER[b.year] || 99;
    if (oa !== ob) return oa - ob;
    return (a.display_order || 0) - (b.display_order || 0);
  });

  return res.json({ success: true, data: sorted });
}

/**
 * POST /api/team
 * Add a new team member. Optional photo upload.
 */
async function addMember(req, res) {
  const { name, role, year, email, display_order } = req.body;

  if (!name || !role || !year) {
    return res.status(400).json({
      success: false,
      error: 'Name, role, and year are required.',
    });
  }

  if (!['faculty', '4th', '3rd', '2nd', '1st'].includes(year)) {
    return res.status(400).json({
      success: false,
      error: 'Year must be one of: faculty, 4th, 3rd, 2nd, 1st.',
    });
  }

  let photo_url = null;
  let storage_path = null;

  // Handle optional photo upload
  if (req.file) {
    const ext = path.extname(req.file.originalname) || '.jpg';
    const uniqueName = `${year}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(uniqueName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ success: false, error: uploadError.message });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName);
    photo_url = urlData.publicUrl;
    storage_path = uniqueName;
  }

  const { data, error } = await supabase
    .from('team_members')
    .insert([
      {
        name: name.trim(),
        role: role.trim(),
        year,
        photo_url,
        storage_path,
        email: email ? email.trim() : null,
        display_order: display_order ? parseInt(display_order, 10) : 0,
      },
    ])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data });
}

/**
 * PUT /api/team/:id
 * Update a team member's details. Photo replacement handled separately.
 */
async function updateMember(req, res) {
  const { id } = req.params;
  const { name, role, year, email, display_order } = req.body;

  const updates = {};
  if (name !== undefined) updates.name = name.trim();
  if (role !== undefined) updates.role = role.trim();
  if (year !== undefined) {
    if (!['faculty', '4th', '3rd', '2nd', '1st'].includes(year)) {
      return res.status(400).json({
        success: false,
        error: 'Year must be one of: faculty, 4th, 3rd, 2nd, 1st.',
      });
    }
    updates.year = year;
  }
  if (email !== undefined) updates.email = email.trim();
  if (display_order !== undefined) updates.display_order = parseInt(display_order, 10);

  // Handle optional photo upload
  if (req.file) {
    // Delete old photo first
    const { data: existing } = await supabase
      .from('team_members')
      .select('storage_path')
      .eq('id', id)
      .single();

    if (existing?.storage_path) {
      await supabase.storage.from(BUCKET).remove([existing.storage_path]);
    }

    const ext = path.extname(req.file.originalname) || '.jpg';
    const uniqueName = `${updates.year || 'member'}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(uniqueName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      return res.status(500).json({ success: false, error: uploadError.message });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName);
    updates.photo_url = urlData.publicUrl;
    updates.storage_path = uniqueName;
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ success: false, error: 'No fields to update.' });
  }

  const { data, error } = await supabase
    .from('team_members')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: 'Team member not found.' });
  }

  return res.json({ success: true, data });
}

/**
 * DELETE /api/team/:id
 * Remove a team member and their photo from storage.
 */
async function deleteMember(req, res) {
  const { id } = req.params;

  // Get storage_path before deleting
  const { data: record } = await supabase
    .from('team_members')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (record?.storage_path) {
    await supabase.storage.from(BUCKET).remove([record.storage_path]);
  }

  const { error } = await supabase.from('team_members').delete().eq('id', id);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data: { message: 'Team member deleted successfully.' } });
}

module.exports = { getTeam, addMember, updateMember, deleteMember };
