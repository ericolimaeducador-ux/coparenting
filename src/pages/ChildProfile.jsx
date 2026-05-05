import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Edit, Syringe, Heart, School, FileText, Activity, Download, Phone, Mail, MapPin, Plus, Lock } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge, Spinner, Avatar } from '@/components/ui/misc'
import { calculateAge, formatDate } from '@/lib/utils'
import ChildForm from '@/components/children/ChildForm'
import HealthRecordForm from '@/components/children/HealthRecordForm'
import SchoolRecordForm from '@/components/children/SchoolRecordForm'
import { SecureFileLink } from '@/components/shared/SecureFile'

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex justify-between text-sm py-1.5 border-b border-slate-50 last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-slate-900 text-right max-w-[60%]">{value}</span>
    </div>
  )
}

export default function ChildProfile() {
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [showEdit, setShowEdit] = useState(false)
  const [showHealthForm, setShowHealthForm] = useState(false)
  const [showSchoolForm, setShowSchoolForm] = useState(false)

  const { data: child, isLoading } = useQuery({
    queryKey: ['child', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('children').select('*').eq('id', id).single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })

  const { data: healthRecords = [] } = useQuery({
    queryKey: ['health-records', id],
    queryFn: async () => {
      const { data } = await supabase.from('health_records').select('*').eq('child_id', id).order('date', { ascending: false })
      return data || []
    },
    enabled: !!id,
  })

  const { data: schoolRecords = [] } = useQuery({
    queryKey: ['school-records', id],
    queryFn: async () => {
      const { data } = await supabase.from('school_records').select('*').eq('child_id', id).order('date', { ascending: false })
      return data || []
    },
    enabled: !!id,
  })

  if (!id) return <div className="text-center py-12 text-muted-foreground">ID da criança não informado.</div>
  if (isLoading) return <div className="flex justify-center py-12"><Spinner size="lg" /></div>
  if (!child) return <div className="text-center py-12 text-muted-foreground">Criança não encontrada.</div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar src={child.photo_url} name={child.full_name} size="xl" />
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-2xl font-bold text-slate-900">{child.full_name}</h1>
            <p className="text-muted-foreground">{calculateAge(child.birth_date)} · Nasceu em {formatDate(child.birth_date)}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {child.blood_type && <Badge variant="destructive">{child.blood_type}</Badge>}
              {child.health_insurance && <Badge variant="default">{child.health_insurance}</Badge>}
              {child.allergies?.map(a => <Badge key={a} variant="warning">{a}</Badge>)}
              {child.medications?.map(m => <Badge key={m} variant="sage">{m}</Badge>)}
            </div>
          </div>
          <div className="flex gap-2 self-start sm:self-center">
            <Button variant="outline" className="gap-2" onClick={() => setShowEdit(true)}>
              <Edit className="h-4 w-4" /> Editar
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/vaccination?id=${id}`)}>
              <Syringe className="h-4 w-4" /> Vacinas
            </Button>
          </div>
        </div>

        {/* Quick info pills */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-50 text-sm text-muted-foreground">
          {child.school_name && (
            <span className="flex items-center gap-1"><School className="h-3.5 w-3.5" /> {child.school_name} {child.school_grade && `· ${child.school_grade}`}</span>
          )}
          {child.sus_number && <span>SUS: {child.sus_number}</span>}
          {child.health_insurance_number && <span>Convênio: {child.health_insurance_number}</span>}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="health">
        <TabsList className="w-full grid grid-cols-4">
          <TabsTrigger value="health" className="gap-1"><Heart className="h-3.5 w-3.5 hidden sm:block" />Saúde</TabsTrigger>
          <TabsTrigger value="school" className="gap-1"><School className="h-3.5 w-3.5 hidden sm:block" />Escola</TabsTrigger>
          <TabsTrigger value="notes" className="gap-1"><Activity className="h-3.5 w-3.5 hidden sm:block" />Notas</TabsTrigger>
          <TabsTrigger value="docs" className="gap-1"><FileText className="h-3.5 w-3.5 hidden sm:block" />Docs</TabsTrigger>
        </TabsList>

        <TabsContent value="health">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Dados de saúde</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="Altura" value={child.height_cm ? `${child.height_cm} cm` : null} />
                <InfoRow label="Peso" value={child.weight_kg ? `${child.weight_kg} kg` : null} />
                <InfoRow label="Tipo sanguíneo" value={child.blood_type} />
                <InfoRow label="Convênio" value={child.health_insurance} />
                <InfoRow label="Nº convênio" value={child.health_insurance_number} />
                <InfoRow label="Cartão SUS" value={child.sus_number} />
                {child.medical_history && (
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Histórico médico</p>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{child.medical_history}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {healthRecords.length > 0 && (
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Registros de saude</CardTitle>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowHealthForm(true)}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {healthRecords.map(rec => (
                    <div key={rec.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(rec.date)} {rec.doctor_name && `· Dr(a). ${rec.doctor_name}`}</p>
                        {rec.notes && <p className="text-xs text-slate-600 mt-1">{rec.notes}</p>}
                      </div>
                      {rec.attachment_url && (
                        <SecureFileLink href={rec.attachment_url}>
                          <Button size="icon-sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                        </SecureFileLink>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {healthRecords.length === 0 && (
              <Card>
                <CardContent className="pt-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Nenhum registro de saude anexado.</p>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowHealthForm(true)}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar registro
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="school">
          <div className="space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Dados escolares</CardTitle></CardHeader>
              <CardContent>
                <InfoRow label="Escola" value={child.school_name} />
                <InfoRow label="Série/Ano" value={child.school_grade} />
                {child.school_email && (
                  <div className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-50">
                    <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                    <a href={`mailto:${child.school_email}`} className="text-primary-600 hover:underline">{child.school_email}</a>
                  </div>
                )}
                {child.school_whatsapp && (
                  <div className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-50">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{child.school_whatsapp}</span>
                  </div>
                )}
                {child.school_phone && (
                  <div className="flex items-center gap-2 text-sm py-1.5 border-b border-slate-50">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{child.school_phone}</span>
                  </div>
                )}
                {child.school_address && (
                  <div className="flex items-center gap-2 text-sm py-1.5">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{child.school_address}</span>
                  </div>
                )}
                {child.activities?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-50">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Atividades extracurriculares</p>
                    <div className="flex flex-wrap gap-1.5">
                      {child.activities.map(a => <Badge key={a} variant="secondary">{a}</Badge>)}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {schoolRecords.length > 0 && (
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base">Registros escolares</CardTitle>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowSchoolForm(true)}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar
                  </Button>
                </CardHeader>
                <CardContent className="space-y-3">
                  {schoolRecords.map(rec => (
                    <div key={rec.id} className="flex items-start gap-3 rounded-xl border border-slate-100 p-3">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{rec.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(rec.date)} {rec.subject && `· ${rec.subject}`} {rec.grade != null && `· Nota: ${rec.grade}`}</p>
                        {rec.notes && <p className="text-xs text-slate-600 mt-1">{rec.notes}</p>}
                      </div>
                      {rec.attachment_url && (
                        <SecureFileLink href={rec.attachment_url}>
                          <Button size="icon-sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                        </SecureFileLink>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}
            {schoolRecords.length === 0 && (
              <Card>
                <CardContent className="pt-5 text-center">
                  <p className="text-sm text-muted-foreground mb-3">Nenhum registro escolar anexado.</p>
                  <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowSchoolForm(true)}>
                    <Plus className="h-3.5 w-3.5" /> Adicionar registro
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="notes">
          <Card>
            <CardContent className="pt-5 space-y-4">
              {[
                { key: 'emotional_notes', label: '💛 Emocional' },
                { key: 'behavioral_notes', label: '🎯 Comportamental' },
                { key: 'spiritual_notes', label: '🌿 Espiritual' },
                { key: 'social_activities', label: '👥 Social' },
                { key: 'cultural_activities', label: '🎨 Cultural' },
              ].map(({ key, label }) => child[key] ? (
                <div key={key} className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-2">{label}</p>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">{child[key]}</p>
                </div>
              ) : null)}
              {!child.emotional_notes && !child.behavioral_notes && !child.spiritual_notes && (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhuma nota registrada ainda.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="docs">
          <Card>
            <CardContent className="pt-5">
              <div className="mb-3 flex gap-2 rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5 shrink-0" />
                <span>Upload de documentos fica desativado no beta cortesia. Por enquanto, use apenas a foto da crianca em thumbnail.</span>
              </div>
              {(!child.documents || child.documents.length === 0) ? (
                <p className="text-sm text-muted-foreground text-center py-4">Nenhum documento anexado.</p>
              ) : (
                <div className="space-y-2">
                  {child.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                      <FileText className="h-5 w-5 text-primary-600 shrink-0" />
                      <span className="flex-1 text-sm">{doc.name}</span>
                      <SecureFileLink href={doc.url}>
                        <Button size="icon-sm" variant="ghost"><Download className="h-3.5 w-3.5" /></Button>
                      </SecureFileLink>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showEdit && (
        <ChildForm
          open={showEdit}
          child={child}
          onClose={() => setShowEdit(false)}
          onSaved={() => { qc.invalidateQueries(['child', id]); setShowEdit(false) }}
        />
      )}
      {showHealthForm && (
        <HealthRecordForm
          open={showHealthForm}
          childId={id}
          onClose={() => setShowHealthForm(false)}
          onSaved={() => { qc.invalidateQueries(['health-records', id]); setShowHealthForm(false) }}
        />
      )}
      {showSchoolForm && (
        <SchoolRecordForm
          open={showSchoolForm}
          childId={id}
          onClose={() => setShowSchoolForm(false)}
          onSaved={() => { qc.invalidateQueries(['school-records', id]); setShowSchoolForm(false) }}
        />
      )}
    </div>
  )
}
