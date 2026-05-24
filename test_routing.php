<?php

class AlertRoutingService
{
    /**
     * @param string $type
     * @param bool $isRural
     * @return array
     */
    public function dispatch(string $type, bool $isRural): array
    {
        switch ($type) {
            case 'vol':
            case 'cambriolage':
            case 'violence_domestique':
                return ['police'];
            
            case 'conflit':
            case 'activite_suspecte':
                return $isRural ? ['gendarmerie'] : ['police'];
                
            case 'incendie':
                return ['pompiers'];
                
            case 'accident':
                return ['pompiers', 'police'];
                
            case 'personne_egaree':
                return ['police', 'gendarmerie'];
                
            case 'objet_suspect':
                return ['garde_presidentielle', 'police'];
                
            case 'evenement_derangeant':
                return ['brigade_labale'];
                
            default:
                return ['police'];
        }
    }
}

$service = new AlertRoutingService();

$types = [
    'vol',
    'cambriolage',
    'violence_domestique',
    'conflit',
    'activite_suspecte',
    'incendie',
    'accident',
    'personne_egaree',
    'objet_suspect',
    'evenement_derangeant'
];

echo "RÉSULTATS DU ROUTAGE STRICT\n";
echo "===========================\n";

foreach ($types as $type) {
    if (in_array($type, ['conflit', 'activite_suspecte'])) {
        $urbain = implode(' + ', $service->dispatch($type, false));
        $rural = implode(' + ', $service->dispatch($type, true));
        echo str_pad($type, 22) . " : [Urbain] => $urbain | [Rural] => $rural\n";
    } else {
        $institutions = implode(' + ', $service->dispatch($type, false));
        echo str_pad($type, 22) . " : => $institutions\n";
    }
}
