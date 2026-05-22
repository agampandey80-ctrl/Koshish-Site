/**
 * Notice Controller
 * CRUD operations for the notice board.
 */

const supabase = require('../config/supabaseClient');

/**
 * GET /api/notices
 * Return all active notices, newest first.
 */
async function getNotices(req, res) {
  const { data, error } = await supabase
    .from('notices')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data });
}

/**
 * POST /api/notices
 * Create a new notice. Requires JWT.
 */
async function createNotice(req, res) {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      error: 'Title and content are required.',
    });
  }

  const { data, error } = await supabase
    .from('notices')
    .insert([{ title: title.trim(), content: content.trim() }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data });
}

/**
 * PUT /api/notices/:id
 * Edit an existing notice. Requires JWT.
 */
async function updateNotice(req, res) {
  const { id } = req.params;
  const { title, content, is_active } = req.body;

  const updates = { updated_at: new Date().toISOString() };
  if (title !== undefined) updates.title = title.trim();
  if (content !== undefined) updates.content = content.trim();
  if (is_active !== undefined) updates.is_active = is_active;

  const { data, error } = await supabase
    .from('notices')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: 'Notice not found.' });
  }

  return res.json({ success: true, data });
}

/**
 * DELETE /api/notices/:id
 * Delete a notice. Requires JWT.
 */
async function deleteNotice(req, res) {
  const { id } = req.params;

  const { error } = await supabase.from('notices').delete().eq('id', id);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data: { message: 'Notice deleted successfully.' } });
}

module.exports = { getNotices, createNotice, updateNotice, deleteNotice };
