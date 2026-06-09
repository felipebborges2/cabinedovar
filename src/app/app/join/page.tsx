import { Notice } from "@/components/notice";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function JoinPoolPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;

  return (
    <>
      <PageHeader
        title="Entrar em bolão"
        description="Use o código de convite enviado pelo administrador do grupo."
      />
      <Notice message={params.error} />
      <Card className="max-w-lg">
        <CardContent className="p-5">
          <form action="/app/pools/join" method="post" className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="invite_code">Codigo de convite</Label>
              <Input
                id="invite_code"
                name="invite_code"
                placeholder="ABCD2345"
                className="font-mono uppercase"
                required
              />
            </div>
            <Button type="submit">Entrar no bolão</Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
}
