/**
 * Notes Controller
 * Handles CRUD operations for class-wise notes
 */
const supabase = require('../config/supabaseClient');

/**
 * GET /api/notes
 * Fetch all notes
 */
async function getNotes(req, res) {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .order('class_name', { ascending: true })
    .order('subject', { ascending: true });

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data });
}

/**
 * POST /api/notes
 * Upsert a note (based on class_name and subject)
 */
async function upsertNote(req, res) {
  const { class_name, subject, pdf_url } = req.body;

  if (!class_name || !subject || !pdf_url) {
    return res.status(400).json({ success: false, error: 'class_name, subject, and pdf_url are required.' });
  }

  const { data, error } = await supabase
    .from('notes')
    .upsert({ class_name, subject, pdf_url }, { onConflict: 'class_name, subject' })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.status(201).json({ success: true, data });
}

/**
 * DELETE /api/notes/:id
 * Delete a note by ID
 */
async function deleteNote(req, res) {
  const { id } = req.params;

  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id);

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, message: 'Note deleted successfully.' });
}

module.exports = {
  getNotes,
  upsertNote,
  deleteNote,
};
