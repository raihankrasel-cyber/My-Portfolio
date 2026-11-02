import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = "https://qnmdmsxxcxwzddomwkea.supabase.co";
const publishableKey = "sb_publishable_2bGIWYXcOTSi_jveUCkaFw_jAXly3Z9";
export const supabase = createClient(supabaseUrl, publishableKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
});

let pendingMfa = false;
export const isMfaPending = () => pendingMfa;

async function createCurrentFactorChallenge() {
  pendingMfa = true;
  try {
    const { data: assurance, error: assuranceError } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (assuranceError) throw assuranceError;
    if (assurance.currentLevel !== "aal2" && assurance.nextLevel === "aal2") {
      const { data: factorData, error: factorError } = await supabase.auth.mfa.listFactors();
      if (factorError) throw factorError;
      const factor = (factorData.totp || []).find((item) => item.status === "verified");
      if (!factor) throw new Error("No verified authenticator is available.");
      const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
      if (challengeError) throw challengeError;
      return { requiresMfa: true, factorId: factor.id, challengeId: challenge.id, assurance };
    }
    pendingMfa = false;
    return { requiresMfa: false, assurance };
  } catch (error) {
    pendingMfa = false;
    throw error;
  }
}

export async function signInWithPassword(email, password) {
  pendingMfa = true;
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    pendingMfa = false;
    throw error;
  }
  const challenge = await createCurrentFactorChallenge();
  return { ...challenge, user: data.user };
}

export async function challengeExistingSessionIfNeeded() {
  return createCurrentFactorChallenge();
}

export async function beginFactorChallenge(factorId) {
  pendingMfa = true;
  const { data, error } = await supabase.auth.mfa.challenge({ factorId });
  if (error) {
    pendingMfa = false;
    throw error;
  }
  return { factorId, challengeId: data.id };
}

export async function verifyFactorChallenge(factorId, challengeId, code) {
  pendingMfa = true;
  const { data, error } = await supabase.auth.mfa.verify({ factorId, challengeId, code: code.trim() });
  if (error) throw error;
  pendingMfa = false;
  return data;
}

export async function cancelPendingSignIn() {
  const result = await supabase.auth.signOut();
  pendingMfa = false;
  return result;
}

export function abandonMfaChallenge() {
  pendingMfa = false;
}

export async function enrollTotp(friendlyName = "Portfolio authenticator") {
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName });
  if (error) throw error;
  return data;
}

export async function verifyTotpEnrollment(factorId, code) {
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) throw challengeError;
  const { data, error } = await supabase.auth.mfa.verify({
    factorId,
    challengeId: challenge.id,
    code: code.trim()
  });
  if (error) throw error;
  return data;
}

export async function listTotpFactors() {
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) throw error;
  return (data.totp || []).filter((factor) => factor.status === "verified");
}

export async function unenrollTotp(factorId) {
  const { data, error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) throw error;
  await supabase.auth.refreshSession();
  return data;
}

export async function getAssurance() {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) throw error;
  return data;
}