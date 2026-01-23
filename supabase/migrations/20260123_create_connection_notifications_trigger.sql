-- Migration: Create Notification Trigger for Connection Requests
-- Description: Automatically creates a notification when a connection request is sent.
-- This replaces manual insertion from the frontend which can cause RLS issues.

-- 1. Function to notify on connection request
CREATE OR REPLACE FUNCTION notify_connection_request()
RETURNS TRIGGER AS $$
DECLARE
  v_requester_name TEXT;
  v_metadata JSONB;
BEGIN
  -- Get requester name
  SELECT nome INTO v_requester_name
  FROM profiles
  WHERE id = NEW.requester_id;

  v_metadata := jsonb_build_object(
    'requester_id', NEW.requester_id,
    'actor_name', COALESCE(v_requester_name, 'Um membro'),
    'connection_id', NEW.id
  );

  -- Insert notification for the responder
  INSERT INTO notifications (user_id, type, title, content, metadata)
  VALUES (
    NEW.responder_id,
    'connection_request',
    'Nova solicitação de conexão', -- Will be translated in frontend based on key
    COALESCE(v_requester_name, 'Um membro') || ' quer se conectar com você.',
    v_metadata
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_connection_request ON connections;

-- Create trigger for new requests
CREATE TRIGGER trigger_notify_connection_request
  AFTER INSERT ON connections
  FOR EACH ROW
  EXECUTE FUNCTION notify_connection_request();

-- 2. Function to notify when connection is accepted
CREATE OR REPLACE FUNCTION notify_connection_accepted()
RETURNS TRIGGER AS $$
DECLARE
  v_responder_name TEXT;
  v_metadata JSONB;
BEGIN
  -- Only trigger when status changes to 'accepted'
  IF OLD.status != 'accepted' AND NEW.status = 'accepted' THEN
    
    -- Get responder name (who accepted)
    SELECT nome INTO v_responder_name
    FROM profiles
    WHERE id = NEW.responder_id;

    v_metadata := jsonb_build_object(
      'responder_id', NEW.responder_id,
      'actor_name', COALESCE(v_responder_name, 'Um membro'),
      'connection_id', NEW.id
    );

    -- Insert notification for the requester (who sent the request initially)
    INSERT INTO notifications (user_id, type, title, content, metadata)
    VALUES (
      NEW.requester_id,
      'connection_accepted',
      'Conexão aceita',
      COALESCE(v_responder_name, 'Um membro') || ' aceitou sua solicitação de conexão.',
      v_metadata
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists
DROP TRIGGER IF EXISTS trigger_notify_connection_accepted ON connections;

-- Create trigger for accepted connections
CREATE TRIGGER trigger_notify_connection_accepted
  AFTER UPDATE ON connections
  FOR EACH ROW
  EXECUTE FUNCTION notify_connection_accepted();
