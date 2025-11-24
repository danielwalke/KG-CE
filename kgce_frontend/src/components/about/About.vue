<template>
    <div class="h-full flex justify-center w-full overflow-y-hidden">
        <div class="w-full lg:w-4/5 flex flex-col p-8 bg-black/80 shadow-lg text-white my-4 rounded-sm overflow-y-auto">
            
            <h1 class="font-bold lg:text-6xl text-3xl text-center mb-8">Impressum & Legal</h1>

            <div class="mb-8 border-b border-white/20 pb-8">
                <h2 class="section-title">Impressum (Legal Disclosure)</h2>
                
                <div class="grid lg:grid-cols-2 gap-8 w-full mt-4">
                    <div>
                        <p class="font-bold text-xl mb-2 text-gray-200">Prof. Dr. Robert Heyer</p>
                        <p>
                            Bielefeld University<br>
                            Technical Faculty<br>
                            Universitätsstraße 25<br>
                            33594 Bielefeld<br>
                            Germany
                        </p>
                    </div>
                    <div>
                        <p class="font-bold text-xl mb-2 text-gray-200">Prof. Dr. Robert Heyer</p>
                        <p>
                            Leibniz-Institut für Analytische Wissenschaften - ISAS<br>
                            Bioanalytics<br>
                            Multidimensional Omics Data Analysis<br>
                            ISAS City<br>
                            44139 Dortmund<br>
                            Germany
                        </p>
                    </div>
                </div>

                <div class="mt-6">
                    <h3 class="text-xl font-bold mb-2">Kontakt</h3>
                    <p>
                        E-Mail: 
                        <a href="mailto:support@mdoa-tools.bi.denbi.de" class="text-blue-400 hover:text-blue-300 underline transition-colors">
                            support@mdoa-tools.bi.denbi.de
                        </a>
                    </p>
                </div>
            </div>

            <div class="mb-8 border-b border-white/20 pb-8">
                <h2 class="section-title">Disclaimer for Predictions</h2>
                <p class="mb-4">
                    The predictions provided on this website are for informational purposes only and do not constitute professional advice. We strive to provide accurate and up-to-date information, but we cannot guarantee that the predictions are correct.
                </p>
                <p class="mb-4 text-red-300">
                    It is your sole responsibility to rely on the accuracy of the predictions. We assume no liability for any loss or damage suffered by you as a result of using the predictions provided on this website.
                </p>
                
                <h3 class="sub-title">Important Notes</h3>
                <ul class="list-disc list-inside pl-4 space-y-2 lg:text-lg text-base font-semibold opacity-90">
                    <li>The predictions are based on data and algorithms that may be flawed.</li>
                    <li>Unforeseen events can affect the accuracy of the predictions.</li>
                    <li>You should use the predictions in conjunction with other information and your own judgment.</li>
                </ul>
            </div>

            <div class="mb-8 border-b border-white/20 pb-8">
                <h2 class="section-title">Exclusion of liability (disclaimer)</h2>
                
                <h3 class="sub-title">Liability for content</h3>
                <p class="mb-4">
                    As a service provider, we are responsible for our own content on these pages in accordance with §7 para.1 TMG (Deutsches Telemediengesetz) and general laws. According to §8 to 10 TMG, however, we as a service provider are not obliged to monitor transmitted or stored third-party information or to investigate circumstances that indicate illegal activity. Obligations to remove or block the use of information in accordance with general legislation remain unaffected by this. However, liability in this respect is only possible from the time of knowledge of a specific infringement. As soon as we become aware of such infringements, we will remove this content immediately.
                </p>

                <h3 class="sub-title">Liability for links</h3>
                <p class="mb-4">
                    Our website contains links to external third-party websites over whose content we have no influence. Therefore, we cannot accept any liability for this third-party content. The respective provider or operator of the pages is always responsible for the content of the linked pages. The linked pages were checked for possible legal violations at the time of linking. Illegal content was not recognizable at the time of linking. However, permanent monitoring of the content of the linked pages is not reasonable without concrete evidence of an infringement. If we become aware of any legal infringements, we will remove such links immediately.
                </p>

                <h3 class="sub-title">Copyright</h3>
                <p>
                    The content and works created by the site operators on these pages are subject to German copyright law. Duplication, processing, distribution and any form of commercialization of such material beyond the scope of the copyright law shall require the prior written consent of its respective author or creator. Downloads and copies of this site are only permitted for private, non-commercial use. Insofar as the content on this site was not created by the operator, the copyrights of third parties are respected. In particular, third-party content is identified as such. Should you nevertheless become aware of a copyright infringement, please inform us accordingly. If we become aware of any infringements, we will remove such content immediately.
                </p>
            </div>


            <div class="text-center text-gray-400 text-sm font-mono mt-4">
                Current version: v:0.1.0
            </div>

        </div>
    </div>
</template>

<script setup>
// Assuming Contributor is imported globally or you need to import it here
// import Contributor from './components/Contributor.vue';

// Props/Data needed for the v-for
defineProps({
    contributors: {
        type: Array,
        default: () => []
    }
});
</script>

<style scoped>
@reference "../../style.css";

/* Reusing the exact p styling from Home.vue */
p {
    @apply text-justify lg:text-lg text-base font-semibold text-gray-100 leading-relaxed;
}

/* Helper classes to keep template clean and consistent with Home.vue typography */
.section-title {
    @apply font-bold lg:text-4xl text-2xl mb-6 text-white;
}

.sub-title {
    @apply italic font-semibold lg:text-2xl text-lg mt-6 mb-3 text-gray-300;
}
</style>