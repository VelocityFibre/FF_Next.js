"""
WebSocket Integration for Pipeline Orchestration.

Integrates WebSocket broadcasting into the pipeline execution lifecycle
to provide real-time updates to connected clients.
"""

import asyncio
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID

import structlog

from ..websocket import event_broadcaster
from .models import (
    PipelineRun,
    AgentExecution,
    ExecutionStatus,
    PipelineStatus
)

logger = structlog.get_logger()


class OrchestrationWebSocketHandler:
    """
    Handles WebSocket event broadcasting for pipeline orchestration.
    """
    
    def __init__(self):
        self.enabled = True
        self.event_queue: asyncio.Queue = asyncio.Queue()
        self.processing_task: Optional[asyncio.Task] = None
        
        logger.info("orchestration_websocket_handler_initialized")
    
    async def start_processing(self):
        """Start processing WebSocket events."""
        if not self.processing_task:
            self.processing_task = asyncio.create_task(self._process_events())
    
    async def stop_processing(self):
        """Stop processing WebSocket events."""
        if self.processing_task:
            self.processing_task.cancel()
            try:
                await self.processing_task
            except asyncio.CancelledError:
                pass
            self.processing_task = None
    
    async def _process_events(self):
        """Process queued WebSocket events."""
        while True:
            try:
                event = await self.event_queue.get()
                await self._handle_event(event)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.error("websocket_event_processing_error", error=str(e))
    
    async def _handle_event(self, event: Dict[str, Any]):
        """Handle a WebSocket event."""
        event_type = event.get('type')
        
        if event_type == 'pipeline_started':
            await self.on_pipeline_started(
                event['pipeline_id'],
                event['pipeline_run']
            )
        elif event_type == 'pipeline_completed':
            await self.on_pipeline_completed(
                event['pipeline_id'],
                event['pipeline_run'],
                event['result']
            )
        elif event_type == 'agent_started':
            await self.on_agent_started(
                event['pipeline_id'],
                event['execution']
            )
        elif event_type == 'agent_completed':
            await self.on_agent_completed(
                event['pipeline_id'],
                event['execution']
            )
        elif event_type == 'agent_failed':
            await self.on_agent_failed(
                event['pipeline_id'],
                event['execution'],
                event['error']
            )
        elif event_type == 'progress_update':
            await self.on_progress_update(
                event['pipeline_id'],
                event['pipeline_run']
            )
    
    # Event Handlers
    
    async def on_pipeline_started(self, pipeline_id: str, pipeline_run: PipelineRun):
        """Broadcast pipeline start event."""
        if not self.enabled:
            return
        
        try:
            await event_broadcaster.broadcast_pipeline_event(
                pipeline_id,
                'started',
                {
                    'name': pipeline_run.name,
                    'total_agents': pipeline_run.total_agents,
                    'feature_brief': pipeline_run.feature_brief,
                    'started_at': pipeline_run.started_at.isoformat() if pipeline_run.started_at else None
                }
            )
            
            logger.info(
                "websocket_pipeline_started_broadcast",
                pipeline_id=pipeline_id
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="pipeline_started",
                error=str(e)
            )
    
    async def on_pipeline_completed(
        self, 
        pipeline_id: str, 
        pipeline_run: PipelineRun,
        result: Any
    ):
        """Broadcast pipeline completion event."""
        if not self.enabled:
            return
        
        try:
            await event_broadcaster.broadcast_completion(
                pipeline_id,
                pipeline_run.status.value,
                pipeline_run.duration_seconds or 0,
                result.get_success_rate() if hasattr(result, 'get_success_rate') else 0,
                pipeline_run.artifacts
            )
            
            logger.info(
                "websocket_pipeline_completed_broadcast",
                pipeline_id=pipeline_id,
                status=pipeline_run.status.value
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="pipeline_completed",
                error=str(e)
            )
    
    async def on_agent_started(self, pipeline_id: str, execution: AgentExecution):
        """Broadcast agent start event."""
        if not self.enabled:
            return
        
        try:
            await event_broadcaster.broadcast_agent_event(
                pipeline_id,
                execution.agent_type,
                'started',
                {
                    'execution_id': str(execution.id),
                    'attempt': execution.attempt_number,
                    'dependencies': execution.depends_on,
                    'started_at': execution.started_at.isoformat() if execution.started_at else None
                }
            )
            
            logger.debug(
                "websocket_agent_started_broadcast",
                pipeline_id=pipeline_id,
                agent_type=execution.agent_type
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="agent_started",
                error=str(e)
            )
    
    async def on_agent_completed(self, pipeline_id: str, execution: AgentExecution):
        """Broadcast agent completion event."""
        if not self.enabled:
            return
        
        try:
            confidence_score = 0.0
            if execution.output_data:
                confidence_score = execution.output_data.confidence_score
            
            await event_broadcaster.broadcast_agent_event(
                pipeline_id,
                execution.agent_type,
                'completed',
                {
                    'execution_id': str(execution.id),
                    'duration_seconds': execution.duration_seconds,
                    'confidence_score': confidence_score,
                    'attempts': execution.attempt_number,
                    'completed_at': execution.completed_at.isoformat() if execution.completed_at else None
                }
            )
            
            logger.debug(
                "websocket_agent_completed_broadcast",
                pipeline_id=pipeline_id,
                agent_type=execution.agent_type
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="agent_completed",
                error=str(e)
            )
    
    async def on_agent_failed(
        self, 
        pipeline_id: str, 
        execution: AgentExecution,
        error: str
    ):
        """Broadcast agent failure event."""
        if not self.enabled:
            return
        
        try:
            await event_broadcaster.broadcast_error(
                pipeline_id,
                'agent_failure',
                error or execution.last_error or "Unknown error",
                agent_type=execution.agent_type,
                recoverable=execution.can_retry()
            )
            
            logger.warning(
                "websocket_agent_failed_broadcast",
                pipeline_id=pipeline_id,
                agent_type=execution.agent_type,
                error=error
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="agent_failed",
                error=str(e)
            )
    
    async def on_progress_update(self, pipeline_id: str, pipeline_run: PipelineRun):
        """Broadcast progress update."""
        if not self.enabled:
            return
        
        try:
            await event_broadcaster.broadcast_progress_update(
                pipeline_id,
                pipeline_run.progress_percentage,
                pipeline_run.completed_agents,
                pipeline_run.total_agents,
                pipeline_run.status.value
            )
            
            # Also broadcast individual agent statuses
            agent_statuses = {}
            for execution in pipeline_run.executions:
                agent_statuses[execution.agent_type] = {
                    'status': execution.status.value,
                    'progress': execution.progress_percentage,
                    'attempts': execution.attempt_number
                }
            
            await event_broadcaster.broadcast_pipeline_event(
                pipeline_id,
                'agent_status_update',
                {'agents': agent_statuses}
            )
            
            logger.debug(
                "websocket_progress_broadcast",
                pipeline_id=pipeline_id,
                progress=pipeline_run.progress_percentage
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="progress_update",
                error=str(e)
            )
    
    async def on_log_message(
        self,
        pipeline_id: str,
        level: str,
        message: str,
        agent_type: Optional[str] = None,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """Broadcast log message."""
        if not self.enabled:
            return
        
        try:
            await event_broadcaster.broadcast_log_message(
                pipeline_id,
                level,
                message,
                agent_type=agent_type,
                metadata=metadata
            )
        except Exception as e:
            logger.error(
                "websocket_broadcast_error",
                event="log_message",
                error=str(e)
            )
    
    # Queue events for async processing
    
    def queue_pipeline_started(self, pipeline_id: str, pipeline_run: PipelineRun):
        """Queue pipeline start event."""
        self.event_queue.put_nowait({
            'type': 'pipeline_started',
            'pipeline_id': pipeline_id,
            'pipeline_run': pipeline_run
        })
    
    def queue_pipeline_completed(
        self,
        pipeline_id: str,
        pipeline_run: PipelineRun,
        result: Any
    ):
        """Queue pipeline completion event."""
        self.event_queue.put_nowait({
            'type': 'pipeline_completed',
            'pipeline_id': pipeline_id,
            'pipeline_run': pipeline_run,
            'result': result
        })
    
    def queue_agent_started(self, pipeline_id: str, execution: AgentExecution):
        """Queue agent start event."""
        self.event_queue.put_nowait({
            'type': 'agent_started',
            'pipeline_id': pipeline_id,
            'execution': execution
        })
    
    def queue_agent_completed(self, pipeline_id: str, execution: AgentExecution):
        """Queue agent completion event."""
        self.event_queue.put_nowait({
            'type': 'agent_completed',
            'pipeline_id': pipeline_id,
            'execution': execution
        })
    
    def queue_agent_failed(
        self,
        pipeline_id: str,
        execution: AgentExecution,
        error: str
    ):
        """Queue agent failure event."""
        self.event_queue.put_nowait({
            'type': 'agent_failed',
            'pipeline_id': pipeline_id,
            'execution': execution,
            'error': error
        })
    
    def queue_progress_update(self, pipeline_id: str, pipeline_run: PipelineRun):
        """Queue progress update."""
        self.event_queue.put_nowait({
            'type': 'progress_update',
            'pipeline_id': pipeline_id,
            'pipeline_run': pipeline_run
        })


# Global WebSocket handler instance
websocket_handler = OrchestrationWebSocketHandler()


# Helper functions for easy integration

async def broadcast_pipeline_started(pipeline_id: str, pipeline_run: PipelineRun):
    """Broadcast pipeline start event."""
    await websocket_handler.on_pipeline_started(pipeline_id, pipeline_run)


async def broadcast_pipeline_completed(
    pipeline_id: str,
    pipeline_run: PipelineRun,
    result: Any
):
    """Broadcast pipeline completion event."""
    await websocket_handler.on_pipeline_completed(pipeline_id, pipeline_run, result)


async def broadcast_agent_started(pipeline_id: str, execution: AgentExecution):
    """Broadcast agent start event."""
    await websocket_handler.on_agent_started(pipeline_id, execution)


async def broadcast_agent_completed(pipeline_id: str, execution: AgentExecution):
    """Broadcast agent completion event."""
    await websocket_handler.on_agent_completed(pipeline_id, execution)


async def broadcast_agent_failed(
    pipeline_id: str,
    execution: AgentExecution,
    error: str
):
    """Broadcast agent failure event."""
    await websocket_handler.on_agent_failed(pipeline_id, execution, error)


async def broadcast_progress_update(pipeline_id: str, pipeline_run: PipelineRun):
    """Broadcast progress update."""
    await websocket_handler.on_progress_update(pipeline_id, pipeline_run)