/**
 * Run UV control: lamp on when circulation pump on and flow OK; track runtime for lamp replacement.
 */

import { supabase } from './supabase.js';
import { computeUvLamp, addUvRuntime } from './uvControl.js';

export interface UvControlInput {
  circulation_pump?: number | boolean;
  flow_ok?: boolean;
}

export async function runUvControl(input: UvControlInput = {}): Promise<void> {
  const now = new Date();

  const { data: stateRow } = await supabase
    .from('device_state')
    .select('circulation_pump, flow_ok, uv_lamp, uv_hour_counter, uv_counter_updated_at')
    .eq('id', 'climate')
    .single();

  let circulationPump = (stateRow?.circulation_pump === 'on' ? 'on' : 'off') as 'on' | 'off';
  let flowOk = stateRow?.flow_ok ?? false;

  if (input.circulation_pump !== undefined) {
    circulationPump = input.circulation_pump ? 'on' : 'off';
  }
  if (input.flow_ok !== undefined) {
    flowOk = input.flow_ok;
  }

  const uvLamp = computeUvLamp(circulationPump, flowOk);

  const currentCounter = stateRow?.uv_hour_counter ?? 0;
  const counterUpdatedAt = stateRow?.uv_counter_updated_at
    ? new Date(stateRow.uv_counter_updated_at)
    : null;
  const currentUvLamp = (stateRow?.uv_lamp === 'on' ? 'on' : 'off') as 'on' | 'off';

  const { uv_hour_counter, uv_counter_updated_at } = addUvRuntime(
    currentCounter,
    counterUpdatedAt,
    currentUvLamp === 'on',
    now
  );

  const updates: Record<string, unknown> = {
    id: 'climate',
    circulation_pump: circulationPump,
    flow_ok: flowOk,
    uv_lamp: uvLamp,
    uv_hour_counter,
    uv_counter_updated_at: uv_counter_updated_at.toISOString(),
    updated_at: now.toISOString(),
  };

  await supabase.from('device_state').upsert(updates, { onConflict: 'id' });
}
