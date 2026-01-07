import { useState } from 'react';
import {
  type JiraSubscription,
  useCreateJiraSubscriptionMutation,
  useDeleteJiraSubscriptionMutation,
  useListJiraWebhooksQuery,
} from '../shared/src/web';

function CreateSubscriptionForm({ onClose }: { onClose: () => void }) {
  const [projectKey, setProjectKey] = useState('');
  const [changeType, setChangeType] = useState('created');
  const [createSubscription, { isLoading, error }] =
    useCreateJiraSubscriptionMutation();

  const handleCreate = async () => {
    try {
      await createSubscription({ projectKey, changeType }).unwrap();
      onClose();
    } catch (_err) {
      /* empty */
    }
  };

  const changeTypeOptions = [
    { value: 'issue', label: 'Issue' },
    { value: 'project', label: 'Project' },
    { value: 'comment', label: 'Comment' },
    { value: 'board', label: 'Board' },
  ];

  return (
    <div className='webhook-form'>
      <h3>Create New Jira Subscription</h3>
      <div className='form-group'>
        <label htmlFor='project-key'>Project Key</label>
        <input
          type='text'
          id='project-key'
          value={projectKey}
          onChange={(e) => setProjectKey(e.target.value.toUpperCase())}
          placeholder='e.g., AREA'
        />
      </div>
      <div className='form-group'>
        <label htmlFor='changetype-select'>Change Type</label>
        <select
          id='changetype-select'
          value={changeType}
          onChange={(e) => setChangeType(e.target.value)}
        >
          {changeTypeOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <div className='error-message'>
          Failed to create subscription. See console for details.
        </div>
      )}
      <div className='form-actions'>
        <button
          type='button'
          onClick={handleCreate}
          className='btn-primary'
          disabled={isLoading}
        >
          {isLoading ? 'Creating...' : 'Create'}
        </button>
        <button type='button' onClick={onClose} className='btn-secondary'>
          Cancel
        </button>
      </div>
    </div>
  );
}

export function Jira() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const {
    data: subscriptions,
    isLoading,
    isError,
  } = useListJiraWebhooksQuery();
  const [deleteSubscription, { isLoading: isDeleting }] =
    useDeleteJiraSubscriptionMutation();

  const handleDelete = async (id: string) => {
    try {
      await deleteSubscription({ id }).unwrap();
    } catch (_err) {
      /* empty */
    }
  };

  return (
    <div className='Jira-page'>
      <h1>Jira Integration</h1>
      <div className='Jira-content'>
        <div className='webhooks-section'>
          <h2>Jira Webhook Subscriptions</h2>
          {!showCreateForm && (
            <button
              type='button'
              onClick={() => setShowCreateForm(true)}
              className='btn-primary'
            >
              Create Subscription
            </button>
          )}

          {showCreateForm && (
            <CreateSubscriptionForm onClose={() => setShowCreateForm(false)} />
          )}

          {isLoading && <p>Loading subscriptions...</p>}
          {isError && (
            <div className='error-message'>
              Failed to load subscriptions. Is your Jira account linked?
            </div>
          )}

          <ul className='webhook-list'>
            {subscriptions && subscriptions.length === 0 && (
              <li className='no-webhooks'>No subscriptions configured.</li>
            )}
            {subscriptions?.map((sub: JiraSubscription) => (
              <li key={sub.id} className='webhook-item'>
                <div className='webhook-info'>
                  <span className='webhook-resource'>
                    Resource: {sub.resource}
                  </span>
                  <span>Change: {sub.changeType}</span>
                  <span>
                    Expires: {new Date(sub.expirationDateTime).toLocaleString()}
                  </span>
                </div>
                <button
                  type='button'
                  onClick={() => handleDelete(sub.id)}
                  className='btn-delete'
                  disabled={isDeleting}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
