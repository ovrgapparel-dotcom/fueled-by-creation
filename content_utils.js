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
async function uploadContentFile(file, bucket = 'media_bucket') {

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

        let isLiked = false;
        if (existing) {
            await window.sbClient.from('likes').delete().eq('id', existing.id);
            isLiked = false;
        } else {
            await window.sbClient.from('likes').insert([{ topic_id: topicId, user_id: userId }]);
            isLiked = true;
        }

        // Sync count to topics table (as a fallback for triggers)
        try {
            const { data: topic } = await window.sbClient.from('topics').select('likes_count').eq('id', topicId).single();
            const newCount = (topic.likes_count || 0) + (isLiked ? 1 : -1);
            await window.sbClient.from('topics').update({ likes_count: Math.max(0, newCount) }).eq('id', topicId);
        } catch (syncErr) {
            console.warn('Count sync error (non-critical):', syncErr);
        }

        return isLiked;
    } catch (error) {
        console.error('Error toggling like:', error);
    }
}

/**
 * Submits a comment for a topic.
 * @param {string} topicId 
 * @param {string} userId 
 * @param {string} content 
 */
async function submitTopicComment(topicId, userId, content) {
    if (!window.sbClient) return;
    try {
        const { data, error } = await window.sbClient
            .from('comments')
            .insert([{ topic_id: topicId, user_id: userId, content: content }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error submitting comment:', error);
    }
}

/**
 * Increments the view count for a topic.
 * @param {string} topicId 
 */
async function incrementTopicViews(topicId) {
    if (!window.sbClient) return;
    try {
        await window.sbClient.rpc('increment_views', { topic_id: topicId });
    } catch (error) {
        // Fallback if RPC isn't defined yet, or just ignore for now
        console.warn('View increment RPC failed, trying manual update');
        try {
            const { data } = await window.sbClient.from('topics').select('views_count').eq('id', topicId).single();
            await window.sbClient.from('topics').update({ views_count: (data.views_count || 0) + 1 }).eq('id', topicId);
        } catch (e) {
            console.error('Manual view increment failed:', e);
        }
    }
}

// Export functions to global scope for app.js access
window.uploadContentFile = uploadContentFile;
window.saveCommunityTopic = saveCommunityTopic;
window.fetchCommunityTopics = fetchCommunityTopics;
window.toggleTopicLike = toggleTopicLike;
window.submitTopicComment = submitTopicComment;
window.incrementTopicViews = incrementTopicViews;

