/* 
 * Content Utilities — Supabase Topics & Storage Integration
 * Ports the logic from the recovered React component to vanilla JS
 */

/**
 * Uploads a file to Supabase Storage.
 * @param {File} file - The file to upload.
 * @param {string} bucket - The bucket name (default: 'content_uploads').
 * @returns {Promise<string>} - The public URL of the uploaded file.
 */
async function uploadContentFile(file, bucket = 'content_uploads') {
    if (!window.sbClient) throw new Error('Supabase client not initialized');

    try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `uploads/${fileName}`;

        const { data, error } = await window.sbClient.storage
            .from(bucket)
            .upload(filePath, file);

        if (error) throw error;

        const { data: { publicUrl } } = window.sbClient.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error('Error uploading file:', error.message);
        throw error;
    }
}

/**
 * Saves a new topic (article, event, or thread) to the database.
 * @param {Object} topicData - The topic data.
 * @returns {Promise<Object>} - The saved topic record.
 */
async function saveCommunityTopic(topicData) {
    if (!window.sbClient) throw new Error('Supabase client not initialized');

    try {
        const { data, error } = await window.sbClient
            .from('topics')
            .insert([topicData])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error saving topic:', error.message);
        throw error;
    }
}

/**
 * Fetches all topics, sorted by engagement scores.
 * @returns {Promise<Array>} - List of topics.
 */
async function fetchCommunityTopics() {
    if (!window.sbClient) return [];

    try {
        const { data, error } = await window.sbClient
            .from('topics')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        // Manual sorting by "heat" (likes_count * 2 + comments_count + views_count)
        return data.sort((a, b) => {
            const scoreA = (a.likes_count * 2) + a.comments_count + a.views_count;
            const scoreB = (b.likes_count * 2) + b.comments_count + b.views_count;
            return scoreB - scoreA;
        });
    } catch (error) {
        console.error('Error fetching topics:', error.message);
        return [];
    }
}

/**
 * Records a like for a topic.
 * @param {string} topicId 
 * @param {string} userId 
 */
async function toggleTopicLike(topicId, userId) {
    if (!window.sbClient) return;
    try {
        const { data: existing } = await window.sbClient
            .from('likes')
            .select('*')
            .eq('topic_id', topicId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            await window.sbClient.from('likes').delete().eq('id', existing.id);
            return false;
        } else {
            await window.sbClient.from('likes').insert([{ topic_id: topicId, user_id: userId }]);
            return true;
        }
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

// Export functions to global scope for app.js access
window.uploadContentFile = uploadContentFile;
window.saveCommunityTopic = saveCommunityTopic;
window.fetchCommunityTopics = fetchCommunityTopics;
window.toggleTopicLike = toggleTopicLike;
