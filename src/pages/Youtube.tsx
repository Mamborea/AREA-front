import { type FormEvent, useState } from 'react';
import {
  useCreateYoutubeWebhookMutation,
  useListYoutubeChannelsQuery,
  useListYoutubeWebhooksQuery,
} from '../shared/src/web';

export function Youtube() {
  const [selectedChannelId, setSelectedChannelId] = useState<string | null>(
    null
  );
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const { data: channels = [], isLoading: isLoadingChannels } =
    useListYoutubeChannelsQuery();

  const { data: webhooks = [] } = useListYoutubeWebhooksQuery(
    { channelId: selectedChannelId },
    { skip: !selectedChannelId }
  );

  const [createWebhook, { isLoading: isCreatingWebhook }] =
    useCreateYoutubeWebhookMutation();

  const handleSelectChannel = (channelId: string) => {
    setSelectedChannelId(channelId);
    setShowCreateForm(false);
    setWebhookUrl('');
    setErrorMessage('');
  };

  const handleCreateWebhook = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!selectedChannelId) return;

    try {
      await createWebhook({
        channelId: selectedChannelId,
        webhookUrl,
      }).unwrap();
      setShowCreateForm(false);
      setWebhookUrl('');
    } catch (err) {
      const apiError = err as { data?: { message: string } };
      setErrorMessage(apiError.data?.message || 'Failed to create webhook.');
    }
  };

  if (isLoadingChannels) return <div>Loading channels...</div>;

  return (
    <div className='youtube-page'>
      <h1>YouTube Integration</h1>

      <div className='channels-section'>
        <h2>Your Channels</h2>
        <ul>
          {channels.map((channel) => (
            <li key={channel.id}>
              <button
                type='button'
                onClick={() => handleSelectChannel(channel.id)}
                className={selectedChannelId === channel.id ? 'selected' : ''}
              >
                {channel.title}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {selectedChannelId && (
        <div className='webhooks-section'>
          <h2>Webhooks</h2>
          <button type='button' onClick={() => setShowCreateForm(true)}>
            Create Webhook
          </button>

          {showCreateForm && (
            <form onSubmit={handleCreateWebhook}>
              {errorMessage && <div className='error'>{errorMessage}</div>}
              <div>
                <label htmlFor='webhook-url'>Webhook URL</label>
                <input
                  id='webhook-url'
                  type='url'
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder='https://example.com/webhook'
                  required
                />
              </div>
              <button type='submit' disabled={isCreatingWebhook}>
                {isCreatingWebhook ? 'Creating...' : 'Create'}
              </button>
              <button type='button' onClick={() => setShowCreateForm(false)}>
                Cancel
              </button>
            </form>
          )}

          <ul>
            {webhooks.length === 0 ? (
              <li>No webhooks configured</li>
            ) : (
              webhooks.map((wh) => (
                <li key={wh.id}>
                  <span>{wh.webhookUrl}</span>
                  <span>{wh.active ? 'Active' : 'Inactive'}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
