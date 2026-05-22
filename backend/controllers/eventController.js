/**
 * Event Controller
 * Handles event photo gallery — upload, list, delete.
 * Photos go to Supabase Storage bucket "event-photos".
 */

const supabase = require('../config/supabaseClient');
const path = require('path');
const crypto = require('crypto');

const BUCKET = 'event-photos';

/**
 * GET /api/events
 * Return all event photos. Filter with ?event=udaan or ?event=abhyuday.
 */
async function getEvents(req, res) {
  let query = supabase
    .from('events')
    .select('*')
    .order('uploaded_at', { ascending: false });

  const { event } = req.query;
  if (event && ['udaan', 'abhyuday'].includes(event.toLowerCase())) {
    query = query.eq('event_name', event.toLowerCase());
  }

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ success: false, error: error.message });
  }

  return res.json({ success: true, data });
}

/**
 * POST /api/events/upload
 * Upload an event photo to Supabase Storage and record it in DB.
 * Expects multipart form: file (image), event_name, caption (optional).
 */
async function uploadEventPhoto(req, res) {
  const { event_name, caption } = req.body;

  if (!event_name || !['udaan', 'abhyuday'].includes(event_name.toLowerCase())) {
    return res.status(400).json({
      success: false,
      error: 'event_name must be "udaan" or "abhyuday".',
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      error: 'An image file is required.',
    });
  }

  // Generate a unique filename
  const ext = path.extname(req.file.originalname) || '.jpg';
  const uniqueName = `${event_name}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`;

  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(uniqueName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) {
    return res.status(500).json({ success: false, error: uploadError.message });
  }

  // Get the public URL
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(uniqueName);

  // Insert record into DB
  const { data, error: dbError } = await supabase
    .from('events')
    .insert([
      {
        event_name: event_name.toLowerCase(),
        photo_url: urlData.publicUrl,
        storage_path: uniqueName,
        caption: caption ? caption.trim() : null,
      },
    ])
    .select()
    .single();

  if (dbError) {
    return res.status(500).json({ success: false, error: dbError.message });
  }

  return res.status(201).json({ success: true, data });
}

/**
 * DELETE /api/events/:id
 * Delete a photo from DB and Supabase Storage.
 */
async function deleteEventPhoto(req, res) {
  const { id } = req.params;

  // First, get the storage_path so we can delete the file
  const { data: record, error: fetchError } = await supabase
    .from('events')
    .select('storage_path')
    .eq('id', id)
    .single();

  if (fetchError || !record) {
    return res.status(404).json({ success: false, error: 'Event photo not found.' });
  }

  // Delete from storage
  await supabase.storage.from(BUCKET).remove([record.storage_path]);

  // Delete DB row
  const { error: deleteError } = await supabase.from('events').delete().eq('id', id);

  if (deleteError) {
    return res.status(500).json({ success: false, error: deleteError.message });
  }

  return res.json({ success: true, data: { message: 'Event photo deleted successfully.' } });
}

module.exports = { getEvents, uploadEventPhoto, deleteEventPhoto };
