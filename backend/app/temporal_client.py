import asyncio
import time
from typing import Dict, Any, Optional
from app.config import settings

TEMPORAL_TASK_QUEUE = "evidence-flow-task-queue"

# In-memory workflow execution registry for real-time API status tracking
WORKFLOW_EXECUTION_REGISTRY: Dict[str, Dict[str, Any]] = {}

async def execute_temporal_ingestion_workflow(sovereign_mode: bool = False, git_url: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes EvidenceFlowIngestionWorkflow using Temporal Client SDK with embedded fallback execution.
    """
    workflow_id = f"ef-workflow-{int(time.time())}"
    
    WORKFLOW_EXECUTION_REGISTRY[workflow_id] = {
        "workflow_id": workflow_id,
        "status": "RUNNING",
        "current_step": "Initializing Temporal Durable Execution Workflow...",
        "task_queue": TEMPORAL_TASK_QUEUE,
        "sovereign_mode": sovereign_mode,
        "start_time": time.strftime("%Y-%m-%d %H:%M:%S")
    }

    try:
        from temporalio.client import Client
        client = await Client.connect("localhost:7233")
        from app.temporal_workflows import EvidenceFlowIngestionWorkflow
        
        handle = await client.start_workflow(
            EvidenceFlowIngestionWorkflow.run,
            {"sovereign_mode": sovereign_mode},
            id=workflow_id,
            task_queue=TEMPORAL_TASK_QUEUE,
        )
        result = await handle.result()
        WORKFLOW_EXECUTION_REGISTRY[workflow_id].update({
            "status": "COMPLETED",
            "current_step": "Workflow execution complete via Temporal Cluster",
            "result": result
        })
        return {"workflow_id": workflow_id, "status": "COMPLETED", "result": result}
    except Exception as err:
        # Fallback embedded workflow execution
        from app.pipeline import run_pipeline
        from app.formal_verification import run_full_system_formal_verification
        
        pipeline_res = run_pipeline(sovereign_mode=sovereign_mode, git_url=git_url)
        z3_res = run_full_system_formal_verification()
        
        result = {
            "workflow_status": "COMPLETED",
            "engine": "Temporal IO Durable Execution Engine (Embedded Fallback)",
            "pipeline_summary": pipeline_res,
            "z3_verification": z3_res,
            "notice": f"Executed via embedded worker fallback (Temporal Server notice: {str(err)})"
        }
        
        WORKFLOW_EXECUTION_REGISTRY[workflow_id].update({
            "status": "COMPLETED",
            "current_step": "Workflow completed via embedded worker",
            "result": result
        })
        
        return {
            "workflow_id": workflow_id,
            "status": "COMPLETED",
            "result": result
        }

def get_workflow_status(workflow_id: str) -> Dict[str, Any]:
    """Returns execution status for a given workflow_id."""
    return WORKFLOW_EXECUTION_REGISTRY.get(workflow_id, {
        "workflow_id": workflow_id,
        "status": "UNKNOWN",
        "message": "Workflow ID not found in active registry"
    })
