import { HealthCheck } from "./health-check";
import { HydrateClient, prefetch,trpc } from "@/trpc/server";
export default function TestPage(){
prefetch(trpc.health.queryOptions())
return (
<HydrateClient>
    <div className="flex flex-col items-center justify-center gap-4 p-8">
    <HealthCheck/>
    </div>

</HydrateClient>
)
}