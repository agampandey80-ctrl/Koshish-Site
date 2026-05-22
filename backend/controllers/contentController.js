/**
 * Content Controller
 * Manages site_content key-value pairs (hero_tagline, mission, vision).
 */

const supabase = require('../config/supabaseClient');

/**
 * GET /api/content
 * Return all site_content rows as a key-value object.
 */
async function getContent(req, res) {
  const { data, error } = await supabase.from('site_content').select('*');

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  // Transform array to key-value object for easier frontend consumption
  const content = {};
  (data || []).forEach((row) => {
    content[row.key] = row.value;
  });

  return res.json({ success: true, data: content });
}

/**
 * PUT /api/content/:key
 * Update a single content entry by key. Requires JWT.
 */
async function updateContent(req, res) {
  const { key } = req.params;
  const { value } = req.body;

  if (value === undefined || value === null) {
    return res.status(400).json({
      success: false,
      error: 'A value is required.',
    });
  }

  const { data, error } = await supabase
    .from('site_content')
    .update({ value: value.trim(), updated_at: new Date().toISOString() })
    .eq('key', key)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  if (!data) {
    return res.status(404).json({ success: false, error: `Content key "${key}" not found.` });
  }

  return res.json({ success: true, data });
}

module.exports = { getContent, updateContent };
